import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ECONOMY_CARDS,
  isEconomyCard,
  getEconomyCardById,
  REACTIVE_SHIELD_MANDATE_ID,
  REACTIVE_SHIELD_AMOUNT,
} from './data/economyCards';
import { getTierColorId, getTierFromColorId } from './data/colors';
import { ALL_OCCUPATION_DESIGNS } from './data/occupations';
import Deck from './components/Deck';
import Hand from './components/Hand';
import PlayArea from './components/PlayArea';
import DiceTracks from './components/DiceTracks';
import ColorPalette from './components/ColorPalette';
import ProfileModal from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';
import CardSetDropdown from './components/CardSetDropdown';
import OccupationInfoModal from './components/OccupationInfoModal';
import EvolutionArea from './components/EvolutionArea';
import EconomyArea from './components/EconomyArea';
import BoardDeckPile from './components/BoardDeckPile';
import ChatPanel from './components/ChatPanel';
import MatchPlayersOnline from './components/MatchPlayersOnline';
import Lobby from './components/Lobby';
import AuthScreen from './components/AuthScreen';
import './components/AuthScreen.css';
import RulesModal from './components/RulesModal';
import AbilitiesModal from './components/AbilitiesModal';
import EvolveModal from './components/EvolveModal';
import DeckBuilderModal from './components/DeckBuilderModal';
import CardSaveContextMenu from './components/CardSaveContextMenu';
import ErrorBoundary from './components/ErrorBoundary';
import { getCurrentMatch, leaveMatch, leaveQueue } from './lib/matchmaking';
import {
  getGameState,
  setGameState,
  subscribeGameState,
  createInitialGameState,
  mergeGameState,
} from './lib/gameStateSync';
import { playSound, SOUND_MUTED_STORAGE_KEY } from './lib/sounds';
import { savePersistedGameState, loadPersistedGameState, clearPersistedGameState } from './lib/persistedGameState';
import { normalizeDeckRarity, deckTierFromNormalizedRarity } from './lib/deckRarity';
import { applyPlayerDamage } from './lib/playerDamage';
import { applyPlayerDamageWithFieldMedic, fieldHasFieldMedic } from './lib/fieldMedic';
import { resolveIncomingDamageWithEmergencyHealthcare } from './lib/emergencyHealthcare';
import { addSavedEvolvedCard, getSavedEvolvedCards } from './lib/evolvedCollection';
import {
  EVOLUTION_SOURCE,
  stripEvolutionSlotMeta,
  getEvolutionSlotRefundAmount,
} from './lib/evolutionSlotMeta';
import { buildTurnUpkeepLines } from './lib/turnUpkeepSummary';
import {
  getCharacterDesignById,
  getEntersPlayEffects,
  getEntersPlayTargetEffect,
  getCardPower,
  getCardHealth,
  getMaxHealth,
  getManualAbilityInfo,
  executeManualAbility,
  executeStartOfTurnAbilities,
  executeEndOfTurnAbilities,
} from './lib/abilities';
import { isLocalPracticeMatch } from './lib/localPractice';
import { getCachedDisplayName, resolveDisplayNameForUi, syncAuthProfileToClient } from './lib/profileDisplayName';
import { supabase } from './lib/supabaseClient';
import TutorialPanel from './components/TutorialPanel';
import TurnUpkeepModal from './components/TurnUpkeepModal';
import './App.css';

const THEME_STORAGE_KEY = 'echoes-theme';

const STARTING_HEALTH = 100;
const STARTING_EVOLUTION_POINTS = 20;
/**
 * Action phase: auto end turn after this long (resets on play / attack / evolve).
 * Pre-action: auto Start turn if the player does not click it within this time.
 */
const TURN_TIMER_SECONDS = 60;
const EVOLUTION_POINTS_PER_TURN = 2;
/** Pause between each tutorial opponent step (start of turn, play card, attack, end). */
const TUTORIAL_OPPONENT_ACTION_DELAY_MS = 3000;

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Evolved play cost: 50% Target + Burn cost, 50% Target − Burn cost (minimum 1). */
function computeEvolvedPlayCostFromTargetAndBurn(targetCard, burnCard) {
  const tRaw = Number(targetCard?.playCost);
  const targetCost = Number.isFinite(tRaw) && tRaw >= 1 ? Math.floor(tRaw) : 1;
  const bRaw = Number(burnCard?.playCost);
  const burnCost = Number.isFinite(bRaw) && bRaw >= 0 ? Math.floor(bRaw) : 0;
  const addBurn = Math.random() < 0.5;
  return Math.max(1, addBurn ? targetCost + burnCost : targetCost - burnCost);
}

const DECK_SIZE = 40;
const TEST_OPPONENT_FIELD_SIZE = 4;
const MAX_PLAYER_HAND = 8;
/** Worker — Legacy: draw when this card is Target or Burn and you complete evolution. */
const MASTER_CRAFTPERSON_ID = 'master-craftsperson';

function countMasterCraftspersonInEvolutionSlots(cardA, cardB) {
  return [cardA, cardB].filter((c) => c?.id === MASTER_CRAFTPERSON_ID).length;
}

function buildTestOpponentField() {
  const pool = [];
  ALL_OCCUPATION_DESIGNS.forEach((design) => {
    design.baseCharacters?.forEach((char) => {
      pool.push({ ...char });
    });
  });
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, TEST_OPPONENT_FIELD_SIZE).map((card, i) => ({
    ...card,
    instanceId: `test-opp-${card.id}-${i}-${Date.now()}`,
    currentHealth: card.health ?? 0,
  }));
}

/** Same draw rules as the player: first opponent turn draws 4 (if deck has 4+), then 1 per turn while hand < 8. */
function performTutorialOpponentDraw(deckIn, handIn, firstTurnDrawDone) {
  const MAX_HAND = 8;
  let deck = [...deckIn];
  let hand = [...handIn];
  let firstDone = firstTurnDrawDone;
  let drew = 0;
  if (!firstDone && deck.length >= 4) {
    const actualAmount = Math.min(4, deck.length);
    const drawn = deck.slice(-actualAmount);
    deck = deck.slice(0, -actualAmount);
    hand = [
      ...hand,
      ...drawn.map((c, i) => ({
        ...c,
        instanceId: c.instanceId || `${c.id}-${Date.now()}-${i}`,
      })),
    ];
    firstDone = true;
    drew = actualAmount;
  } else if (firstDone && hand.length < MAX_HAND && deck.length > 0) {
    const drawn = deck.slice(-1);
    deck = deck.slice(0, -1);
    hand = [
      ...hand,
      ...drawn.map((c, i) => ({
        ...c,
        instanceId: c.instanceId || `${c.id}-${Date.now()}-${i}`,
      })),
    ];
    drew = 1;
  }
  return { deck, hand, firstDrawDone: firstDone, drew };
}

function buildStarterDeck() {
  let idSeq = 0;
  const occupationPool = [];
  ALL_OCCUPATION_DESIGNS.forEach((design) => {
    if (!design.baseCharacters?.length) return;
    design.baseCharacters.forEach((char) => {
      for (let copy = 0; copy < 2; copy++) {
        occupationPool.push({ ...char, instanceId: `${char.id}-${idSeq++}` });
      }
    });
  });

  /** All economy cards are always in the deck; remaining slots are random occupations. */
  const economyCount = Math.min(ECONOMY_CARDS.length, DECK_SIZE);
  const occCount = DECK_SIZE - economyCount;
  const economyPart = ECONOMY_CARDS.slice(0, economyCount).map((card) => ({
    ...card,
    instanceId: `${card.id}-${idSeq++}`,
  }));

  const shuffledOcc = shuffle(occupationPool);
  return shuffle([...shuffledOcc.slice(0, occCount), ...economyPart]);
}


const authEnabled = Boolean(supabase);

export default function App() {
  const [view, setView] = useState('lobby'); // 'lobby' | 'game'
  const [matchId, setMatchId] = useState(null);
  const [session, setSession] = useState(null);
  const [authInitializing, setAuthInitializing] = useState(authEnabled);
  const [playerSlot, setPlayerSlot] = useState(null);

  const [health, setHealth] = useState(STARTING_HEALTH);
  const [playerShield, setPlayerShield] = useState(0);
  const [evolutionPoints, setEvolutionPoints] = useState(STARTING_EVOLUTION_POINTS);
  const [deck, setDeck] = useState(buildStarterDeck);
  const [hand, setHand] = useState([]);
  const [field, setField] = useState([]);
  const [economyField, setEconomyField] = useState([]);
  const [evolutionSlots, setEvolutionSlots] = useState([null, null]);
  const [selectedHandId, setSelectedHandId] = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [selectedEconomyId, setSelectedEconomyId] = useState(null);
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) || 'default');
  const [soundMuted, setSoundMuted] = useState(() => localStorage.getItem(SOUND_MUTED_STORAGE_KEY) === 'true');
  const [occupationInfoOpen, setOccupationInfoOpen] = useState(false);
  const [occupationInfoId, setOccupationInfoId] = useState(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [evolveOpen, setEvolveOpen] = useState(false);
  const [abilitiesOpen, setAbilitiesOpen] = useState(false);
  const [deckBuilderOpen, setDeckBuilderOpen] = useState(false);
  const [cardSaveMenu, setCardSaveMenu] = useState(null);

  const savedCollectionEntries = deckBuilderOpen ? getSavedEvolvedCards() : [];
  
  const [turn, setTurn] = useState('player');
  const [playerHasStartedTurn, setPlayerHasStartedTurn] = useState(false);
  const [playerHasDrawnThisTurn, setPlayerHasDrawnThisTurn] = useState(false);
  const [firstTurnDrawDone, setFirstTurnDrawDone] = useState(false);

  const [usedBlackMarketThisTurn, setUsedBlackMarketThisTurn] = useState(false);
  const [usedEducationGrantThisTurn, setUsedEducationGrantThisTurn] = useState(false);
  const [usedHealthcareThisTurn, setUsedHealthcareThisTurn] = useState(false);
  const [usedIndustrialAutomationThisTurn, setUsedIndustrialAutomationThisTurn] = useState(false);
  /** True after a character has been played from hand to field this turn (gates Military Funding −1). */
  const [firstCharacterPlayedFromHandThisTurn, setFirstCharacterPlayedFromHandThisTurn] = useState(false);
  const [blackMarketSelecting, setBlackMarketSelecting] = useState(false);

  const [metaState, setMetaState] = useState(null);
  const lastRestoredMatchRef = useRef(null);
  const [reconnectedJustNow, setReconnectedJustNow] = useState(false);
  const [lastPlayedCardInstanceId, setLastPlayedCardInstanceId] = useState(null);
  const [lastEvolvedCardInstanceId, setLastEvolvedCardInstanceId] = useState(null);
  const [damageFlash, setDamageFlash] = useState(false);
  /** Brief full-viewport shake when the opponent damages our health (synced / local / tutorial). */
  const [screenShake, setScreenShake] = useState(false);
  const [attackSelection, setAttackSelection] = useState([]);
  const [attackedThisTurn, setAttackedThisTurn] = useState([]);
  const [hasAttackedThisTurn, setHasAttackedThisTurn] = useState(false);
  const [usedAbilitiesThisTurn, setUsedAbilitiesThisTurn] = useState([]);
  const [attackToast, setAttackToast] = useState(null);
  const [turnUpkeepOpen, setTurnUpkeepOpen] = useState(false);
  const [turnUpkeepLines, setTurnUpkeepLines] = useState([]);
  const [abilityDiscardSelectingId, setAbilityDiscardSelectingId] = useState(null);
  const [pendingEnterPlayTarget, setPendingEnterPlayTarget] = useState(null);
  const [testOpponentField, setTestOpponentField] = useState([]);
  const [localOpponentHealth, setLocalOpponentHealth] = useState(STARTING_HEALTH);
  const [localOpponentShield, setLocalOpponentShield] = useState(0);
  const [localOpponentEvolutionPoints, setLocalOpponentEvolutionPoints] = useState(STARTING_EVOLUTION_POINTS);
  const [localOpponentEconomyField, setLocalOpponentEconomyField] = useState([]);
  const [localOpponentUsedHealthcareThisTurn, setLocalOpponentUsedHealthcareThisTurn] = useState(false);
  const [localGameOver, setLocalGameOver] = useState(null);
  const [gameOverOverlayDismissed, setGameOverOverlayDismissed] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialDismissed, setTutorialDismissed] = useState(false);
  const [tutorialOpponentActing, setTutorialOpponentActing] = useState(false);
  const [tutorialPlayerDisplayName, setTutorialPlayerDisplayName] = useState(() => getCachedDisplayName());
  const [tutorialOpponentDeck, setTutorialOpponentDeck] = useState([]);
  const [tutorialOpponentHand, setTutorialOpponentHand] = useState([]);
  const [tutorialOpponentFirstDrawDone, setTutorialOpponentFirstDrawDone] = useState(false);

  const tutorialOppFieldRef = useRef(testOpponentField);
  const tutorialOppEconomyRef = useRef(localOpponentEconomyField);
  const tutorialOppEpRef = useRef(localOpponentEvolutionPoints);
  const tutorialOppDeckRef = useRef([]);
  const tutorialOppHandRef = useRef([]);
  const tutorialOppFirstDrawDoneRef = useRef(false);
  const tutorialPlayerHealthRef = useRef(health);
  const tutorialPlayerShieldRef = useRef(playerShield);
  const playerFieldForMedicRef = useRef(field);
  const prevPlayerHealthForFieldMedicRef = useRef(null);
  const deckRef = useRef(deck);
  const endTurnRef = useRef(() => {});
  const handleStartTurnClickRef = useRef(() => {});
  const playerEconomyFieldRef = useRef(economyField);
  const usedHealthcareThisTurnRef = useRef(false);

  const isSyncedMatch = matchId && !isLocalPracticeMatch(matchId);
  const me = metaState && playerSlot ? metaState[playerSlot === 1 ? 'player1' : 'player2'] : null;
  const opponent = metaState && playerSlot ? metaState[playerSlot === 1 ? 'player2' : 'player1'] : null;
  const opponentField = isSyncedMatch && opponent && Array.isArray(opponent.field)
    ? opponent.field
    : (isLocalPracticeMatch(matchId) ? testOpponentField : []);
  const opponentEconomy = (isSyncedMatch && opponent && Array.isArray(opponent.economyField))
    ? opponent.economyField
    : localOpponentEconomyField;
  const displayHealth = isSyncedMatch && me ? me.health : health;
  const displayShield = isSyncedMatch && me ? (me.shield ?? 0) : playerShield;
  const displayEp = isSyncedMatch && me ? me.evolutionPoints : evolutionPoints;
  const displayOpponentHealth = isSyncedMatch && opponent != null
    ? (opponent.health ?? STARTING_HEALTH)
    : localOpponentHealth;
  const displayOpponentShield = isSyncedMatch && opponent != null
    ? (opponent.shield ?? 0)
    : localOpponentShield;
  const displayOpponentEp = isSyncedMatch && opponent != null
    ? (opponent.evolutionPoints ?? STARTING_EVOLUTION_POINTS)
    : localOpponentEvolutionPoints;
  const prevHealthRef = useRef(displayHealth);
  const isPlayerTurn = isSyncedMatch && metaState ? metaState.turn === playerSlot : turn === 'player';
  const gameOver = isSyncedMatch && metaState?.gameOver ? metaState.gameOver : localGameOver;
  const showGameOverOverlay = Boolean(gameOver) && !gameOverOverlayDismissed;
  const canAct = isPlayerTurn && playerHasStartedTurn && !gameOver;

  const [turnTimerKey, setTurnTimerKey] = useState(0);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(TURN_TIMER_SECONDS);
  const bumpTurnTimer = useCallback(() => setTurnTimerKey((k) => k + 1), []);

  const [startTurnTimeRemaining, setStartTurnTimeRemaining] = useState(TURN_TIMER_SECONDS);

  const showLocalOpponentPhase = Boolean(!isSyncedMatch && turn === 'opponent' && !gameOver);
  const showPracticeActionBar = isPlayerTurn || showLocalOpponentPhase;
  const startTurnBlockedByTutorialBot =
    matchId === 'tutorial' && showLocalOpponentPhase && tutorialOpponentActing;
  const canClickStartTurn = !playerHasStartedTurn && !startTurnBlockedByTutorialBot;
  const needsStartTurnCountdown =
    view === 'game' &&
    Boolean(matchId) &&
    !gameOver &&
    canClickStartTurn &&
    showPracticeActionBar;

  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);

  useEffect(() => {
    playerEconomyFieldRef.current = economyField;
  }, [economyField]);

  useEffect(() => {
    usedHealthcareThisTurnRef.current = usedHealthcareThisTurn;
  }, [usedHealthcareThisTurn]);

  useEffect(() => {
    playerFieldForMedicRef.current = field;
  }, [field]);

  useEffect(() => {
    prevPlayerHealthForFieldMedicRef.current = null;
  }, [matchId]);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        if (cancelled) return;
        setSession(s);
        if (s?.user?.id) void syncAuthProfileToClient(s.user.id);
        else void syncAuthProfileToClient(null);
      })
      .catch(() => {
        if (!cancelled) setSession(null);
      })
      .finally(() => {
        if (!cancelled) setAuthInitializing(false);
      });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user?.id) void syncAuthProfileToClient(s.user.id);
      else void syncAuthProfileToClient(null);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    tutorialOppFieldRef.current = testOpponentField;
    tutorialOppEconomyRef.current = localOpponentEconomyField;
    tutorialOppEpRef.current = localOpponentEvolutionPoints;
    tutorialOppDeckRef.current = tutorialOpponentDeck;
    tutorialOppHandRef.current = tutorialOpponentHand;
    tutorialOppFirstDrawDoneRef.current = tutorialOpponentFirstDrawDone;
    tutorialPlayerHealthRef.current = health;
    tutorialPlayerShieldRef.current = playerShield;
  }, [
    testOpponentField,
    localOpponentEconomyField,
    localOpponentEvolutionPoints,
    tutorialOpponentDeck,
    tutorialOpponentHand,
    tutorialOpponentFirstDrawDone,
    health,
    playerShield,
  ]);

  useEffect(() => {
    if (matchId !== 'test') return;
    if (testOpponentField.length === 0) {
      setTestOpponentField(buildTestOpponentField());
    }
  }, [matchId, testOpponentField.length]);

  useEffect(() => {
    if (view !== 'game' || matchId !== 'tutorial') return;
    let cancelled = false;
    setTutorialPlayerDisplayName(getCachedDisplayName());
    resolveDisplayNameForUi().then((name) => {
      if (!cancelled) setTutorialPlayerDisplayName(name);
    });
    return () => {
      cancelled = true;
    };
  }, [view, matchId]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'bright' ? 'bright' : '');
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(SOUND_MUTED_STORAGE_KEY, soundMuted ? 'true' : 'false');
  }, [soundMuted]);

  useEffect(() => {
    getCurrentMatch().then((m) => {
      if (m) {
        setMatchId(m.matchId);
        setPlayerSlot(m.playerSlot);
        setView('game');
      }
    });
  }, []);

  useEffect(() => {
    if (!isSyncedMatch || view !== 'game') return;
    let cancelled = false;
    (async () => {
      let state = await getGameState(matchId);
      if (cancelled) return;
      if (!state || Object.keys(state).length === 0) {
        state = createInitialGameState();
        await setGameState(matchId, state);
      }
      if (!cancelled) setMetaState(state);
    })();
    const unsub = subscribeGameState(matchId, (newState) => setMetaState(newState));
    return () => {
      cancelled = true;
      unsub();
    };
  }, [matchId, isSyncedMatch, view]);

  // Fallback if Realtime misses updates (tab sleep, network): poll shared state periodically.
  useEffect(() => {
    if (!isSyncedMatch || view !== 'game' || !matchId || gameOver) return;
    const id = setInterval(() => {
      void getGameState(matchId).then((s) => {
        if (s) setMetaState(s);
      });
    }, 3000);
    return () => clearInterval(id);
  }, [isSyncedMatch, view, matchId, gameOver]);

  useEffect(() => {
    if (!matchId || !playerSlot || view !== 'game' || !isSyncedMatch) {
      if (!matchId) lastRestoredMatchRef.current = null;
      return;
    }
    const key = `${matchId}-${playerSlot}`;
    if (lastRestoredMatchRef.current === key) return;
    lastRestoredMatchRef.current = key;

    const saved = loadPersistedGameState(matchId, playerSlot);
    if (saved && Array.isArray(saved.deck)) {
      setDeck(saved.deck);
      setHand(Array.isArray(saved.hand) ? saved.hand : []);
      setField(Array.isArray(saved.field) ? saved.field : []);
      setEvolutionSlots(Array.isArray(saved.evolutionSlots) && saved.evolutionSlots.length === 2 ? saved.evolutionSlots : [null, null]);
      setEconomyField(Array.isArray(saved.economyField) ? saved.economyField : []);
      setFirstTurnDrawDone(Boolean(saved.firstTurnDrawDone));
      setPlayerHasDrawnThisTurn(Boolean(saved.playerHasDrawnThisTurn));
      setPlayerHasStartedTurn(Boolean(saved.playerHasStartedTurn));
      setReconnectedJustNow(true);
    } else {
      setDeck(buildStarterDeck());
      setHand([]);
      setField([]);
      setEvolutionSlots([null, null]);
      setEconomyField([]);
      setFirstTurnDrawDone(false);
      setPlayerHasDrawnThisTurn(false);
      setPlayerHasStartedTurn(false);
    }
  }, [matchId, playerSlot, view, isSyncedMatch]);

  useEffect(() => {
    if (view !== 'game' || !matchId || !playerSlot || isSyncedMatch) return;
    setPlayerHasStartedTurn(true);
  }, [view, matchId, playerSlot, isSyncedMatch]);

  useEffect(() => {
    if (!isSyncedMatch || !matchId || !playerSlot) return;
    savePersistedGameState(matchId, playerSlot, {
      deck,
      hand,
      field,
      evolutionSlots,
      economyField,
      firstTurnDrawDone,
      playerHasDrawnThisTurn,
      playerHasStartedTurn,
    });
  }, [isSyncedMatch, matchId, playerSlot, deck, hand, field, evolutionSlots, economyField, firstTurnDrawDone, playerHasDrawnThisTurn, playerHasStartedTurn]);

  // Push our field and economy to shared state (merge with latest server row so we never wipe opponent updates).
  const lastSyncedFieldEconomyRef = useRef({ field: null, economyField: null });
  useEffect(() => {
    if (!isSyncedMatch || !matchId || !playerSlot) return;
    const fieldJson = JSON.stringify(field);
    const economyJson = JSON.stringify(economyField);
    if (
      lastSyncedFieldEconomyRef.current.field === fieldJson &&
      lastSyncedFieldEconomyRef.current.economyField === economyJson
    ) return;

    let cancelled = false;
    void mergeGameState(matchId, (next) => {
      const myKey = playerSlot === 1 ? 'player1' : 'player2';
      if (!next[myKey]) return next;
      next[myKey] = {
        ...next[myKey],
        field: Array.isArray(field) ? JSON.parse(fieldJson) : [],
        economyField: Array.isArray(economyField) ? JSON.parse(economyJson) : [],
      };
      return next;
    }).then((merged) => {
      if (cancelled || !merged) return;
      lastSyncedFieldEconomyRef.current = { field: fieldJson, economyField: economyJson };
      setMetaState(merged);
    });
    return () => {
      cancelled = true;
    };
  }, [isSyncedMatch, matchId, playerSlot, field, economyField]);

  useEffect(() => {
    if (!reconnectedJustNow) return;
    const t = setTimeout(() => setReconnectedJustNow(false), 4000);
    return () => clearTimeout(t);
  }, [reconnectedJustNow]);

  useEffect(() => {
    if (!lastPlayedCardInstanceId) return;
    const t = setTimeout(() => setLastPlayedCardInstanceId(null), 600);
    return () => clearTimeout(t);
  }, [lastPlayedCardInstanceId]);

  useEffect(() => {
    if (!lastEvolvedCardInstanceId) return;
    const t = setTimeout(() => setLastEvolvedCardInstanceId(null), 600);
    return () => clearTimeout(t);
  }, [lastEvolvedCardInstanceId]);

  useEffect(() => {
    if (view !== 'game') return;
    const prev = prevHealthRef.current;
    prevHealthRef.current = displayHealth;
    if (prev != null && displayHealth < prev) {
      setDamageFlash(true);
      const damageDuringOpponentTurn = isSyncedMatch
        ? metaState != null && metaState.turn !== playerSlot
        : turn === 'opponent';
      if (damageDuringOpponentTurn) {
        playSound('attack', soundMuted);
        setScreenShake(true);
      }
    }
  }, [displayHealth, view, isSyncedMatch, metaState?.turn, playerSlot, turn, soundMuted]);

  useEffect(() => {
    if (!damageFlash) return;
    const t = setTimeout(() => setDamageFlash(false), 650);
    return () => clearTimeout(t);
  }, [damageFlash]);

  useEffect(() => {
    if (!screenShake) return;
    const t = setTimeout(() => setScreenShake(false), 520);
    return () => clearTimeout(t);
  }, [screenShake]);

  useEffect(() => {
    if (!attackToast) return;
    const t = setTimeout(() => setAttackToast(null), 3000);
    return () => clearTimeout(t);
  }, [attackToast?.key]);

  const handleMatchFound = useCallback(({ matchId: id, playerSlot: slot }) => {
    setMatchId(id);
    setPlayerSlot(slot);
    setView('game');
  }, []);

  const handleLobbyLogout = useCallback(async () => {
    try {
      await leaveQueue();
    } catch {
      /* ignore */
    }
    if (supabase) await supabase.auth.signOut();
  }, []);

  const enterLocalPractice = useCallback((mode) => {
    setMetaState(null);
    setHealth(STARTING_HEALTH);
    setPlayerShield(0);
    setEvolutionPoints(STARTING_EVOLUTION_POINTS);
    setDeck(buildStarterDeck());
    setHand([]);
    setField([]);
    setEconomyField([]);
    setEvolutionSlots([null, null]);
    setSelectedHandId(null);
    setSelectedFieldId(null);
    setSelectedEconomyId(null);
    setTurn('player');
    setPlayerHasStartedTurn(false);
    setPlayerHasDrawnThisTurn(false);
    setFirstTurnDrawDone(false);
    setUsedBlackMarketThisTurn(false);
    setUsedEducationGrantThisTurn(false);
    setUsedHealthcareThisTurn(false);
    setUsedIndustrialAutomationThisTurn(false);
    setFirstCharacterPlayedFromHandThisTurn(false);
    setBlackMarketSelecting(false);
    setAttackSelection([]);
    setAttackedThisTurn([]);
    setHasAttackedThisTurn(false);
    setUsedAbilitiesThisTurn([]);
    setAbilityDiscardSelectingId(null);
    setPendingEnterPlayTarget(null);
    setAttackToast(null);
    setTurnUpkeepOpen(false);
    setTurnUpkeepLines([]);
    setTestOpponentField([]);
    setLocalOpponentHealth(STARTING_HEALTH);
    setLocalOpponentShield(0);
    setLocalOpponentEvolutionPoints(STARTING_EVOLUTION_POINTS);
    setLocalOpponentEconomyField([]);
    setLocalOpponentUsedHealthcareThisTurn(false);
    setLocalGameOver(null);
    setTutorialOpponentActing(false);
    if (mode === 'tutorial') {
      setTutorialOpponentDeck(buildStarterDeck());
      setTutorialOpponentHand([]);
      setTutorialOpponentFirstDrawDone(false);
    } else {
      setTutorialOpponentDeck([]);
      setTutorialOpponentHand([]);
      setTutorialOpponentFirstDrawDone(false);
    }
    setMatchId(mode);
    setPlayerSlot(1);
    if (mode === 'tutorial') {
      setTutorialStep(0);
      setTutorialDismissed(false);
    }
    setView('game');
    lastRestoredMatchRef.current = null;
  }, []);

  const handleStartTutorial = useCallback(() => {
    enterLocalPractice('tutorial');
  }, [enterLocalPractice]);

  const handleRestartTutorial = useCallback(() => {
    enterLocalPractice('tutorial');
  }, [enterLocalPractice]);

  useEffect(() => {
    if (matchId !== 'tutorial') return;
    if (turn !== 'opponent' || gameOver) {
      setTutorialOpponentActing(false);
      return;
    }

    let cancelled = false;
    setTutorialOpponentActing(true);
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function runTutorialOpponentTurn() {
      let skipYourTurnDing = false;
      try {
        await sleep(TUTORIAL_OPPONENT_ACTION_DELAY_MS);
        if (cancelled) return;

        const oppEconomySnap = tutorialOppEconomyRef.current;
        const oppFieldSnap = tutorialOppFieldRef.current;
        const oppEpSnap = tutorialOppEpRef.current;

        const hasNatInfra = oppEconomySnap.some((c) => c.id === 'national-infrastructure');
        const hasReactiveShield = oppEconomySnap.some((c) => c.id === REACTIVE_SHIELD_MANDATE_ID);
        const oppEpAfterIncome = Math.min(
          oppEpSnap + EVOLUTION_POINTS_PER_TURN + (hasNatInfra ? 1 : 0),
          STARTING_EVOLUTION_POINTS
        );
        const startEffects = executeStartOfTurnAbilities({
          field: oppFieldSnap,
          ep: oppEpSnap,
          epForThresholdAbilities: oppEpAfterIncome,
        });
        let ep = Math.min(
          oppEpSnap + EVOLUTION_POINTS_PER_TURN + (hasNatInfra ? 1 : 0) + (startEffects?.effects?.ep ?? 0),
          STARTING_EVOLUTION_POINTS
        );
        setLocalOpponentEvolutionPoints(ep);
        setLocalOpponentShield(hasReactiveShield ? REACTIVE_SHIELD_AMOUNT : 0);

        await sleep(TUTORIAL_OPPONENT_ACTION_DELAY_MS);
        if (cancelled) return;

        let oppDeck = [...tutorialOppDeckRef.current];
        let oppHand = [...tutorialOppHandRef.current];
        let oppFirstDraw = tutorialOppFirstDrawDoneRef.current;
        const {
          deck: nextOppDeck,
          hand: nextOppHand,
          firstDrawDone: nextOppFirstDraw,
          drew: oppDrew,
        } = performTutorialOpponentDraw(oppDeck, oppHand, oppFirstDraw);
        oppDeck = nextOppDeck;
        oppHand = nextOppHand;
        oppFirstDraw = nextOppFirstDraw;
        setTutorialOpponentDeck(oppDeck);
        setTutorialOpponentHand(oppHand);
        setTutorialOpponentFirstDrawDone(oppFirstDraw);
        tutorialOppDeckRef.current = oppDeck;
        tutorialOppHandRef.current = oppHand;
        tutorialOppFirstDrawDoneRef.current = oppFirstDraw;
        if (oppDrew > 0) playSound('draw', soundMuted);

        let oppField = [...tutorialOppFieldRef.current];
        let oppEconomy = [...tutorialOppEconomyRef.current];
        const oppHasMilitaryFunding = oppEconomy.some((c) => c.id === 'military-funding-program');
        const playable = oppHand.filter((c) => {
          let cost = c.playCost ?? 1;
          if (!isEconomyCard(c) && oppHasMilitaryFunding) {
            cost = Math.max(0, cost - 1);
          }
          if (cost > ep) return false;
          if (isEconomyCard(c)) return oppEconomy.length === 0;
          return oppField.length < 4;
        });
        const econCandidate = playable.find((c) => isEconomyCard(c));
        const charCandidate = playable
          .filter((c) => !isEconomyCard(c))
          .sort((a, b) => (b.playCost ?? 0) - (a.playCost ?? 0))[0];
        const chosen = econCandidate ?? charCandidate;
        if (chosen) {
          let pay = chosen.playCost ?? 1;
          if (!isEconomyCard(chosen) && oppHasMilitaryFunding) {
            pay = Math.max(0, pay - 1);
          }
          ep -= pay;
          setLocalOpponentEvolutionPoints(ep);
          const chosenKey = chosen.instanceId || chosen.id;
          oppHand = oppHand.filter((c) => (c.instanceId || c.id) !== chosenKey);
          setTutorialOpponentHand(oppHand);
          tutorialOppHandRef.current = oppHand;
          if (isEconomyCard(chosen)) {
            const placed = { ...chosen, instanceId: `opp-econ-${Date.now()}` };
            oppEconomy = [placed];
            setLocalOpponentEconomyField(oppEconomy);
          } else {
            const placed = { ...chosen, instanceId: `opp-${chosen.id}-${Date.now()}` };
            placed.currentHealth = getCardHealth(placed, [...oppField, placed]);
            oppField = [...oppField, placed];
            setTestOpponentField(oppField);
          }
          setAttackToast({ message: `Opponent played ${chosen.name}.`, key: Date.now() });
          await sleep(TUTORIAL_OPPONENT_ACTION_DELAY_MS);
        }
        if (cancelled) return;

        const totalPower = oppField.reduce((sum, c) => sum + getCardPower(c, oppField), 0);
        if (totalPower > 0) {
          const h0 = tutorialPlayerHealthRef.current;
          const s0 = tutorialPlayerShieldRef.current;
          const { damage: dmgToApply, consumedHealthcare } = resolveIncomingDamageWithEmergencyHealthcare(
            totalPower,
            playerEconomyFieldRef.current,
            usedHealthcareThisTurnRef.current
          );
          if (consumedHealthcare) {
            usedHealthcareThisTurnRef.current = true;
            setUsedHealthcareThisTurn(true);
          }
          const { health: ph, shield: ps } = applyPlayerDamageWithFieldMedic(
            playerFieldForMedicRef.current,
            h0,
            s0,
            dmgToApply,
            STARTING_HEALTH
          );
          setHealth(ph);
          setPlayerShield(ps);
          const toastMsg = consumedHealthcare
            ? `Opponent attacked for ${totalPower} damage. Emergency Healthcare Act reduced it by 1.`
            : `Opponent attacked for ${totalPower} damage.`;
          setAttackToast({ message: toastMsg, key: Date.now() });
          if (ph <= 0) {
            setLocalGameOver({ winner: 2 });
            skipYourTurnDing = true;
            return;
          }
        }

        await sleep(TUTORIAL_OPPONENT_ACTION_DELAY_MS);
      } finally {
        if (!cancelled) {
          if (!skipYourTurnDing) playSound('yourTurn', soundMuted);
          setTutorialOpponentActing(false);
        }
      }
    }

    runTutorialOpponentTurn();
    return () => {
      cancelled = true;
      setTutorialOpponentActing(false);
    };
  }, [gameOver, matchId, turn, soundMuted]);

  const handleLeaveMatch = useCallback(async () => {
    if (matchId && !isLocalPracticeMatch(matchId)) {
      await leaveMatch(matchId);
      clearPersistedGameState(matchId, playerSlot);
    }
    setMatchId(null);
    setPlayerSlot(null);
    setMetaState(null);
    setTestOpponentField([]);
    setLocalOpponentHealth(STARTING_HEALTH);
    setLocalOpponentShield(0);
    setLocalOpponentEvolutionPoints(STARTING_EVOLUTION_POINTS);
    setLocalOpponentEconomyField([]);
    setLocalOpponentUsedHealthcareThisTurn(false);
    setLocalGameOver(null);
    setTutorialOpponentDeck([]);
    setTutorialOpponentHand([]);
    setTutorialOpponentFirstDrawDone(false);
    setTutorialStep(0);
    setTutorialDismissed(false);
    setTutorialOpponentActing(false);
    setView('lobby');
    lastRestoredMatchRef.current = null;
  }, [matchId, playerSlot]);

  const handleProfileSignOutReturnToLogin = useCallback(async () => {
    setProfileOpen(false);
    await handleLeaveMatch();
  }, [handleLeaveMatch]);

  const drawCards = useCallback((amount) => {
    const n = Math.max(0, Math.floor(Number(amount) || 0));
    if (n === 0) return;
    const currentDeck = deckRef.current;
    if (!Array.isArray(currentDeck) || currentDeck.length === 0) return;
    const actualAmount = Math.min(n, currentDeck.length);
    const drawn = currentDeck.slice(-actualAmount);
    const nextDeck = currentDeck.slice(0, -actualAmount);
    deckRef.current = nextDeck;
    setDeck(nextDeck);
    setHand((h) => [
      ...h,
      ...drawn.map((c, i) => ({
        ...c,
        instanceId: c.instanceId || `${c.id}-${Date.now()}-${i}`,
      })),
    ]);
    playSound('draw', soundMuted);
  }, [soundMuted]);

  const draw = useCallback(() => {
    if (deck.length === 0) return;
    if (!firstTurnDrawDone && deck.length >= 4) {
      drawCards(4);
      setFirstTurnDrawDone(true);
      setPlayerHasDrawnThisTurn(true);
    } else if (firstTurnDrawDone && hand.length < 8) {
      drawCards(1);
      setPlayerHasDrawnThisTurn(true);
    }
  }, [deck, firstTurnDrawDone, hand.length, drawCards]);

  const handleRequestSaveEvolvedCard = useCallback((card, point) => {
    setCardSaveMenu({
      card,
      x: point.clientX,
      y: point.clientY,
    });
  }, []);

  const handleConfirmSaveCardFromMenu = useCallback(() => {
    setCardSaveMenu((prev) => {
      if (!prev?.card) return null;
      const result = addSavedEvolvedCard(prev.card);
      if (result.ok) {
        setAttackToast({
          message: 'Saved to collection. Open Deck Builder to view.',
          key: Date.now(),
        });
      } else {
        setAttackToast({ message: result.message || 'Could not save card.', key: Date.now() });
      }
      return null;
    });
  }, []);

  const handleDismissSaveCardMenu = useCallback(() => {
    setCardSaveMenu(null);
  }, []);

  const applyGameStateChanges = useCallback((changes) => {
    if (!changes) return;
    if (changes.health !== undefined) setHealth((h) => Math.min(h + changes.health, STARTING_HEALTH));
    if (changes.ep !== undefined) setEvolutionPoints((ep) => Math.min(ep + changes.ep, STARTING_EVOLUTION_POINTS));
    if (changes.draw !== undefined) drawCards(changes.draw);
    if (!isSyncedMatch && changes.oppHealth !== undefined) {
      const delta = changes.oppHealth;
      if (delta < 0) {
        const raw = -delta;
        const { damage: effDamage, consumedHealthcare } = resolveIncomingDamageWithEmergencyHealthcare(
          raw,
          localOpponentEconomyField,
          localOpponentUsedHealthcareThisTurn
        );
        if (consumedHealthcare) setLocalOpponentUsedHealthcareThisTurn(true);
        const { health: oh, shield: os } = applyPlayerDamage(
          localOpponentHealth,
          localOpponentShield,
          effDamage
        );
        setLocalOpponentHealth(oh);
        setLocalOpponentShield(os);
        if (oh <= 0) setLocalGameOver({ winner: playerSlot });
      } else {
        setLocalOpponentHealth((h) => Math.min(STARTING_HEALTH, h + delta));
      }
    }
    
    if (isSyncedMatch && matchId) {
      void mergeGameState(matchId, (next) => {
        const myKey = playerSlot === 1 ? 'player1' : 'player2';
        const oppKey = playerSlot === 1 ? 'player2' : 'player1';

        if (changes.health !== undefined) {
          next[myKey].health = Math.min(
            (next[myKey].health ?? STARTING_HEALTH) + changes.health,
            STARTING_HEALTH
          );
        }
        if (changes.ep !== undefined) {
          next[myKey].evolutionPoints = Math.min(
            (next[myKey].evolutionPoints ?? 0) + changes.ep,
            STARTING_EVOLUTION_POINTS
          );
        }
        if (changes.oppHealth !== undefined) {
          const delta = changes.oppHealth;
          if (delta < 0) {
            const opp = next[oppKey];
            const raw = -delta;
            const econ = Array.isArray(opp.economyField) ? opp.economyField : [];
            const alreadyHc = opp.usedEmergencyHealthcareActThisTurn === true;
            const { damage: effDamage, consumedHealthcare } = resolveIncomingDamageWithEmergencyHealthcare(
              raw,
              econ,
              alreadyHc
            );
            const { health: oh, shield: os } = applyPlayerDamage(
              opp.health ?? STARTING_HEALTH,
              opp.shield ?? 0,
              effDamage
            );
            opp.health = oh;
            opp.shield = os;
            if (consumedHealthcare) opp.usedEmergencyHealthcareActThisTurn = true;
          } else {
            next[oppKey].health = Math.min(
              STARTING_HEALTH,
              (next[oppKey].health ?? STARTING_HEALTH) + delta
            );
          }
          if (next[oppKey].health <= 0) next.gameOver = { winner: playerSlot };
        }

        return next;
      }).then((merged) => {
        if (merged) setMetaState(merged);
      });
    }
  }, [
    drawCards,
    isSyncedMatch,
    localOpponentHealth,
    localOpponentShield,
    localOpponentEconomyField,
    localOpponentUsedHealthcareThisTurn,
    matchId,
    playerSlot,
  ]);

  useEffect(() => {
    if (!isSyncedMatch || view !== 'game' || gameOver || !playerSlot) return;
    const h = displayHealth;
    const prev = prevPlayerHealthForFieldMedicRef.current;
    if (prev !== null && h < prev && fieldHasFieldMedic(field)) {
      applyGameStateChanges({ health: 1 });
      prevPlayerHealthForFieldMedicRef.current = Math.min(h + 1, STARTING_HEALTH);
    } else {
      prevPlayerHealthForFieldMedicRef.current = h;
    }
  }, [displayHealth, field, isSyncedMatch, view, gameOver, playerSlot, applyGameStateChanges]);

  const playFromHand = useCallback(() => {
    if (!selectedHandId) return;
    const card = hand.find((c) => (c.instanceId || c.id) === selectedHandId);
    if (!card) return;
    if (!isEconomyCard(card) && field.length >= 4) {
      setAttackToast({ message: 'Field is full (max 4 characters).', key: Date.now() });
      return;
    }
    let cost = card.playCost ?? 1;
    const hasMilitaryFunding = economyField.some((c) => c.id === 'military-funding-program');
    if (!isEconomyCard(card) && hasMilitaryFunding && !firstCharacterPlayedFromHandThisTurn) {
      cost = Math.max(0, cost - 1);
    }
    const currentEp = isSyncedMatch && me ? me.evolutionPoints : evolutionPoints;
    if (currentEp < cost) return;

    // Abstract the ability state application to keep it clean and handle multiplayer sync
    const applyAbilityState = applyGameStateChanges;

    const cardToPlay = { ...card, instanceId: card.instanceId || `${card.id}-${Date.now()}` };
    setEvolutionPoints((ep) => ep - cost);

    if (isEconomyCard(card)) {
      setEconomyField([cardToPlay]);
    } else {
      setFirstCharacterPlayedFromHandThisTurn(true);
      const nextField = [...field, cardToPlay];
      cardToPlay.currentHealth = getCardHealth(cardToPlay, nextField);
      setField((f) => [...f, cardToPlay]);
      setLastPlayedCardInstanceId(cardToPlay.instanceId);
      if (isSyncedMatch) {
        setMetaState((prev) => {
          if (!prev) return prev;
          const next = JSON.parse(JSON.stringify(prev));
          const myKey = playerSlot === 1 ? 'player1' : 'player2';
          next[myKey].evolutionPoints = (next[myKey].evolutionPoints ?? 0) - cost;
          next[myKey].field = nextField.map((c) => ({ ...c }));
          void setGameState(matchId, next);
          return next;
        });
      }

      // Enter-play targeting: deal damage (opponent only) or heal (any character)
      const targetEffect = getEntersPlayTargetEffect(cardToPlay);
      const oppFieldForTarget = isSyncedMatch && opponent && Array.isArray(opponent.field)
        ? opponent.field
        : (isLocalPracticeMatch(matchId) ? testOpponentField : []);
      const hasDamageTarget = targetEffect?.damage && oppFieldForTarget.length > 0;
      const hasHealTarget = targetEffect?.heal && (nextField.length + oppFieldForTarget.length) > 0;
      if (targetEffect && (hasDamageTarget || hasHealTarget)) {
        setPendingEnterPlayTarget({ sourceCardInstanceId: cardToPlay.instanceId, ...targetEffect });
      } else {
        // Enter Play Abilities (immediate)
        const effectsData = getEntersPlayEffects(cardToPlay, { field: nextField, economyField });
        if (effectsData) {
          applyAbilityState(effectsData.effects);
          if (effectsData.message) {
            setAttackToast({ message: effectsData.message, key: Date.now() });
          }
        }
      }
    }
    
    setHand((h) => h.filter((c) => (c.instanceId || c.id) !== selectedHandId));
    setSelectedHandId(null);
    playSound('play', soundMuted);
    bumpTurnTimer();

    const refundMessages = [];
    const hasIndustrialAutomation = economyField.some((c) => c.id === 'industrial-automation') || (isEconomyCard(card) && card.id === 'industrial-automation');
    if (hasIndustrialAutomation && !usedIndustrialAutomationThisTurn) {
      setUsedIndustrialAutomationThisTurn(true);
      applyAbilityState({ ep: 1 });
      refundMessages.push('Industrial Automation: Refunded +1 Evolution.');
    }
    const hasGuildMaster = field.some((c) => c.id === 'guild-master') || (!isEconomyCard(card) && card.id === 'guild-master');
    if (hasGuildMaster) {
      applyAbilityState({ ep: 1 });
      refundMessages.push('Guild Master: Refunded +1 Evolution.');
    }
    if (refundMessages.length > 0) {
      setAttackToast({ message: refundMessages.join(' '), key: Date.now() });
    }
  }, [selectedHandId, hand, field, evolutionPoints, economyField, isSyncedMatch, metaState, me, opponent, matchId, testOpponentField, playerSlot, soundMuted, usedIndustrialAutomationThisTurn, firstCharacterPlayedFromHandThisTurn, drawCards, bumpTurnTimer]);

  const selectHand = (card) => {
    const id = card?.instanceId || card?.id;
    setSelectedHandId((prev) => (prev === id ? null : id));
    setSelectedFieldId(null);
    setSelectedEconomyId(null);
  };

  const selectField = (card) => {
    const id = card?.instanceId || card?.id;
    setSelectedFieldId((prev) => (prev === id ? null : id));
    setSelectedHandId(null);
    setSelectedEconomyId(null);
    const power = getCardPower(card, field);
    const canAttack = power > 0 && !attackedThisTurn.includes(id) && !hasAttackedThisTurn;
    if (canAttack) {
      setAttackSelection((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }
  };

  const selectEconomy = (card) => {
    if (!card) return;
    const id = card.instanceId || card.id;
    setSelectedEconomyId((prev) => (prev === id ? null : id));
    setSelectedHandId(null);
    setSelectedFieldId(null);
  };

  const handleEnterPlayTargetSelect = useCallback((targetCard) => {
    if (!pendingEnterPlayTarget || !targetCard) return;
    const targetId = targetCard.instanceId || targetCard.id;

    // Heal: any character (our field or opponent's)
    if (pendingEnterPlayTarget.heal) {
      const healAmount = pendingEnterPlayTarget.heal ?? 0;
      const inOurField = field.find((c) => (c.instanceId || c.id) === targetId);
      if (inOurField) {
        const currentHealth = getCardHealth(inOurField, field);
        const maxHealth = getMaxHealth(inOurField, field);
        const newHealth = Math.min(currentHealth + healAmount, maxHealth);
        const updated = { ...inOurField, currentHealth: newHealth, regeneratesThisTurn: Boolean(pendingEnterPlayTarget.regenThisTurn) };
        setField((prev) => prev.map((c) => ((c.instanceId || c.id) === targetId ? updated : c)));
        setAttackToast({ message: `${inOurField.name || targetCard.name} gained +${healAmount} HP and Regenerate this turn.`, key: Date.now() });
        setPendingEnterPlayTarget(null);
        playSound('play', soundMuted);
        return;
      }
      // Target is on opponent field
      if (isSyncedMatch && matchId) {
        void mergeGameState(matchId, (next) => {
          const oppKey = playerSlot === 1 ? 'player2' : 'player1';
          const oppField = next[oppKey]?.field ?? [];
          const target = oppField.find((c) => (c.instanceId || c.id) === targetId);
          if (!target) return null;
          const currentHealth = getCardHealth(target, oppField);
          const maxHealth = getMaxHealth(target, oppField);
          const newHealth = Math.min(currentHealth + healAmount, maxHealth);
          next[oppKey].field = next[oppKey].field.map((c) => {
            if ((c.instanceId || c.id) !== targetId) return c;
            return { ...c, currentHealth: newHealth, regeneratesThisTurn: Boolean(pendingEnterPlayTarget.regenThisTurn) };
          });
          return next;
        }).then((merged) => {
          if (merged) {
            setMetaState(merged);
            setAttackToast({
              message: `${targetCard.name} gained +${healAmount} HP and Regenerate this turn.`,
              key: Date.now(),
            });
            setPendingEnterPlayTarget(null);
            playSound('play', soundMuted);
          }
        });
        return;
      }
      const target = testOpponentField.find((c) => (c.instanceId || c.id) === targetId);
      if (!target) return;
      const currentHealth = getCardHealth(target, testOpponentField);
      const maxHealth = getMaxHealth(target, testOpponentField);
      const newHealth = Math.min(currentHealth + healAmount, maxHealth);
      setTestOpponentField((prev) =>
        prev.map((c) => ((c.instanceId || c.id) === targetId ? { ...c, currentHealth: newHealth, regeneratesThisTurn: Boolean(pendingEnterPlayTarget.regenThisTurn) } : c))
      );
      setAttackToast({ message: `${target.name || targetCard.name} gained +${healAmount} HP and Regenerate this turn.`, key: Date.now() });
      setPendingEnterPlayTarget(null);
      playSound('play', soundMuted);
      return;
    }

    // Damage: opponent only
    if (isSyncedMatch && matchId) {
      const dmg = pendingEnterPlayTarget.damage;
      void mergeGameState(matchId, (next) => {
        const oppKey = playerSlot === 1 ? 'player2' : 'player1';
        const oppField = next[oppKey]?.field ?? [];
        const target = oppField.find((c) => (c.instanceId || c.id) === targetId);
        if (!target) return null;
        const currentHealth = getCardHealth(target, oppField);
        const newHealth = currentHealth - dmg;
        const nextOppField = next[oppKey].field
          .map((c) => {
            const cid = c.instanceId || c.id;
            if (cid !== targetId) return c;
            if (newHealth <= 0) return null;
            return { ...c, currentHealth: newHealth };
          })
          .filter(Boolean);
        next[oppKey].field = nextOppField;
        return next;
      }).then((merged) => {
        if (!merged) return;
        setMetaState(merged);
        const oppKey = playerSlot === 1 ? 'player2' : 'player1';
        const t = merged[oppKey]?.field?.find((c) => (c.instanceId || c.id) === targetId);
        const defeated = !t;
        setAttackToast({
          message: `Dealt ${dmg} damage to ${targetCard.name}${defeated ? ' (defeated)!' : '.'}`,
          key: Date.now(),
        });
        setPendingEnterPlayTarget(null);
        playSound('attack', soundMuted);
      });
      return;
    }

    const target = testOpponentField.find((c) => (c.instanceId || c.id) === targetId);
    if (!target) return;
    const currentHealth = getCardHealth(target, testOpponentField);
    const newHealth = currentHealth - pendingEnterPlayTarget.damage;
    setTestOpponentField((prev) =>
      prev
        .map((c) => {
          const cid = c.instanceId || c.id;
          if (cid !== targetId) return c;
          if (newHealth <= 0) return null;
          return { ...c, currentHealth: newHealth };
        })
        .filter(Boolean)
    );
    setAttackToast({
      message: `Dealt ${pendingEnterPlayTarget.damage} damage to ${target.name || targetCard.name}${newHealth <= 0 ? ' (defeated)!' : '.'}`,
      key: Date.now(),
    });
    setPendingEnterPlayTarget(null);
    playSound('attack', soundMuted);
  }, [pendingEnterPlayTarget, isSyncedMatch, playerSlot, matchId, soundMuted, testOpponentField, field]);

  const placeInEvolutionSlot = useCallback((slotIndex) => {
    if (slotIndex < 0 || slotIndex > 1) return;
    const fromHand = Boolean(selectedHandId);
    const fromEconomy = Boolean(selectedEconomyId);
    const card = fromHand
      ? hand.find((c) => (c.instanceId || c.id) === selectedHandId)
      : fromEconomy
        ? economyField.find((c) => (c.instanceId || c.id) === selectedEconomyId)
        : field.find((c) => (c.instanceId || c.id) === selectedFieldId);
    if (!card) return;
    
    const otherSlotIndex = 1 - slotIndex;
    const other = evolutionSlots[otherSlotIndex];
    if (other != null) {
      const cardEconomy = isEconomyCard(card);
      const otherEconomy = isEconomyCard(other);
      if (cardEconomy !== otherEconomy) return;
    }

    let cost = card.playCost ?? 1;
    const hasEducationGrant = economyField.some((c) => c.id === 'universal-education-grant');
    const appliedEducationDiscount = hasEducationGrant && !usedEducationGrantThisTurn;
    if (appliedEducationDiscount) {
      cost = Math.max(0, cost - 1);
      setUsedEducationGrantThisTurn(true);
    }
    const ep = isSyncedMatch && me ? me.evolutionPoints : evolutionPoints;
    if (ep < cost) return;

    const evolutionSource = fromHand
      ? EVOLUTION_SOURCE.HAND
      : fromEconomy
        ? EVOLUTION_SOURCE.ECONOMY
        : EVOLUTION_SOURCE.FIELD;

    setEvolutionPoints((e) => e - cost);
    if (isSyncedMatch && matchId) {
      void mergeGameState(matchId, (next) => {
        const myKey = playerSlot === 1 ? 'player1' : 'player2';
        next[myKey].evolutionPoints = (next[myKey].evolutionPoints ?? 0) - cost;
        return next;
      }).then((merged) => {
        if (merged) setMetaState(merged);
      });
    }

    setEvolutionSlots((prev) => {
      const next = [...prev];
      if (next[slotIndex] != null) return prev;
      next[slotIndex] = {
        ...card,
        instanceId: card.instanceId || `${card.id}-${Date.now()}`,
        _evolutionSource: evolutionSource,
        _evolutionSlotCostPaid: cost,
        _evolutionEducationDiscount: appliedEducationDiscount,
      };
      return next;
    });
    
    if (fromHand) {
      setHand((h) => h.filter((c) => (c.instanceId || c.id) !== selectedHandId));
      setSelectedHandId(null);
    } else if (fromEconomy) {
      setEconomyField([]);
      setSelectedEconomyId(null);
    } else {
      setField((f) => f.filter((c) => (c.instanceId || c.id) !== selectedFieldId));
      setSelectedFieldId(null);
      setAttackSelection((prev) => prev.filter((id) => id !== selectedFieldId));
    }
  }, [selectedHandId, selectedFieldId, selectedEconomyId, hand, field, economyField, evolutionPoints, evolutionSlots, usedEducationGrantThisTurn, isSyncedMatch, me, playerSlot, matchId]);

  const returnFromEvolutionSlot = useCallback(
    (slotIndex, destination = 'hand') => {
      const card = evolutionSlots[slotIndex];
      if (!card) return;

      const source = card._evolutionSource;
      const refund = getEvolutionSlotRefundAmount(card);

      if (destination === 'field') {
        if (isEconomyCard(card) || source !== EVOLUTION_SOURCE.FIELD) return;
      }
      if (destination === 'economy') {
        if (!isEconomyCard(card) || source !== EVOLUTION_SOURCE.ECONOMY) return;
      }

      if (card._evolutionEducationDiscount) {
        setUsedEducationGrantThisTurn(false);
      }

      setEvolutionPoints((e) => Math.min(e + refund, STARTING_EVOLUTION_POINTS));
      if (isSyncedMatch && matchId) {
        void mergeGameState(matchId, (next) => {
          const myKey = playerSlot === 1 ? 'player1' : 'player2';
          next[myKey].evolutionPoints = Math.min(
            (next[myKey].evolutionPoints ?? 0) + refund,
            STARTING_EVOLUTION_POINTS
          );
          return next;
        }).then((merged) => {
          if (merged) setMetaState(merged);
        });
      }

      const cleaned = stripEvolutionSlotMeta(card);
      const instanceId = cleaned.instanceId || `${cleaned.id}-${Date.now()}`;

      setEvolutionSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = null;
        return next;
      });

      if (destination === 'field') {
        setField((f) => [...f, { ...cleaned, instanceId }]);
      } else if (destination === 'economy') {
        setEconomyField([{ ...cleaned, instanceId }]);
      } else {
        setHand((h) => [...h, { ...cleaned, instanceId }]);
      }
    },
    [evolutionSlots, isSyncedMatch, matchId, playerSlot]
  );

  const canDraw = firstTurnDrawDone ? hand.length < 8 : deck.length >= 4;
  const canClickDraw = canAct && canDraw && !playerHasDrawnThisTurn && deck.length > 0;

  /** Opponent deck size on the board: known in tutorial; hidden online / test (not synced). */
  const opponentBoardDeckCount = isSyncedMatch ? null : matchId === 'tutorial' ? tutorialOpponentDeck.length : null;

  const turnIndicator = (() => {
    if (isSyncedMatch && !isPlayerTurn) {
      return { who: "Opponent's turn", action: 'Wait for the other player.' };
    }
    if (!isSyncedMatch && turn === 'opponent' && matchId === 'tutorial' && tutorialOpponentActing) {
      return { who: "Opponent's turn", action: 'The tutorial opponent is taking their turn.' };
    }
    if (!isSyncedMatch && turn === 'opponent') {
      return { who: 'Your turn', action: 'Click Start turn to begin (+2 evolution points).' };
    }
    if (!playerHasStartedTurn) return { who: 'Your turn', action: 'Click Start turn to begin (+2 evolution points).' };
    if (canClickDraw) return { who: 'Your turn', action: 'Draw phase — click Draw to take one card, then play or End turn.' };
    return { who: 'Your turn', action: 'Play cards or click End turn when done.' };
  })();

  const selectedCard = selectedHandId
    ? hand.find((c) => (c.instanceId || c.id) === selectedHandId)
    : selectedFieldId
      ? field.find((c) => (c.instanceId || c.id) === selectedFieldId)
      : selectedEconomyId
        ? economyField.find((c) => (c.instanceId || c.id) === selectedEconomyId)
        : null;
  const rawPlayCost = selectedCard?.playCost ?? 1;
  const hasMilitaryFundingProgram = economyField.some((c) => c.id === 'military-funding-program');
  const militaryFundingDiscountsSelectedHandCharacter =
    Boolean(selectedHandId && selectedCard && !isEconomyCard(selectedCard) && hasMilitaryFundingProgram && !firstCharacterPlayedFromHandThisTurn);
  const playCost = militaryFundingDiscountsSelectedHandCharacter ? Math.max(0, rawPlayCost - 1) : rawPlayCost;
  const epForCost = isSyncedMatch && me ? me.evolutionPoints : evolutionPoints;
  const canAffordPlay = epForCost >= playCost;
  const fieldFull = field.length >= 4;
  const canPlayCharacterToField = !fieldFull;
  const canPlayCard = selectedHandId && canAffordPlay && (selectedCard && isEconomyCard(selectedCard) ? true : canPlayCharacterToField);

  const selectedCardManualAbilityInfo = selectedFieldId 
    ? getManualAbilityInfo(field.find((c) => (c.instanceId || c.id) === selectedFieldId)) 
    : null;
  const canAffordManualAbility = selectedCardManualAbilityInfo ? epForCost >= selectedCardManualAbilityInfo.cost : false;
  const hasUsedSelectedAbility = selectedFieldId ? usedAbilitiesThisTurn.includes(selectedFieldId) : false;

  const endTurn = useCallback(() => {
    const currentEp = isSyncedMatch && me ? me.evolutionPoints : evolutionPoints;
    const endEffects = executeEndOfTurnAbilities({ field, economyField, ep: currentEp });

    if (endEffects) {
      applyGameStateChanges(endEffects.effects);
      if (endEffects.message) {
        setAttackToast({ message: endEffects.message, key: Date.now() });
      }
    }

    // Regenerate: heal 1 for characters with regeneratesThisTurn, then clear the flag
    setField((prev) =>
      prev.map((c) => {
        if (!c.regeneratesThisTurn) return c;
        const cur = getCardHealth(c, prev);
        const max = getMaxHealth(c, prev);
        const next = { ...c, currentHealth: Math.min(cur + 1, max) };
        delete next.regeneratesThisTurn;
        return next;
      })
    );
    setTestOpponentField((prev) =>
      prev.map((c) => {
        if (!c.regeneratesThisTurn) return c;
        const cur = getCardHealth(c, prev);
        const max = getMaxHealth(c, prev);
        const next = { ...c, currentHealth: Math.min(cur + 1, max) };
        delete next.regeneratesThisTurn;
        return next;
      })
    );

    setPlayerHasStartedTurn(false);
    setTurn('opponent');
    setLocalOpponentUsedHealthcareThisTurn(false);
    if (isSyncedMatch && matchId) {
      void mergeGameState(matchId, (next) => {
        next.turn = next.turn === 1 ? 2 : 1;
        const oppKey = playerSlot === 1 ? 'player2' : 'player1';
        next[oppKey].field = (next[oppKey].field ?? []).map((c) => {
          if (!c.regeneratesThisTurn) return c;
          const cur = getCardHealth(c, next[oppKey].field);
          const max = getMaxHealth(c, next[oppKey].field);
          const cardNext = { ...c, currentHealth: Math.min(cur + 1, max) };
          delete cardNext.regeneratesThisTurn;
          return cardNext;
        });
        return next;
      }).then((merged) => {
        if (merged) setMetaState(merged);
      });
    }
  }, [isSyncedMatch, matchId, playerSlot, field, economyField, evolutionPoints, me, applyGameStateChanges]);

  endTurnRef.current = endTurn;

  useEffect(() => {
    if (!canAct || gameOver) return undefined;
    setTurnTimeRemaining(TURN_TIMER_SECONDS);
    const id = setInterval(() => {
      setTurnTimeRemaining((s) => {
        if (s <= 0) return 0;
        if (s <= 1) {
          queueMicrotask(() => endTurnRef.current());
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [canAct, gameOver, turnTimerKey]);

  const startTurn = useCallback(() => {
    setFirstCharacterPlayedFromHandThisTurn(false);
    setUsedBlackMarketThisTurn(false);
    setUsedEducationGrantThisTurn(false);
    setUsedHealthcareThisTurn(false);
    setUsedIndustrialAutomationThisTurn(false);
    setAttackedThisTurn([]);
    setHasAttackedThisTurn(false);
    setUsedAbilitiesThisTurn([]);
    setAbilityDiscardSelectingId(null);
    
    const baseGain = EVOLUTION_POINTS_PER_TURN;
    const hasNationalInfrastructure = economyField.some((c) => c.id === 'national-infrastructure');
    const extraEp = hasNationalInfrastructure ? 1 : 0;
    const hasReactiveShield = economyField.some((c) => c.id === REACTIVE_SHIELD_MANDATE_ID);
    if (hasReactiveShield) setPlayerShield(REACTIVE_SHIELD_AMOUNT);
    else setPlayerShield(0);

    const currentEp = isSyncedMatch && me ? (me.evolutionPoints ?? STARTING_EVOLUTION_POINTS) : evolutionPoints;
    const epAfterStartIncome = Math.min(currentEp + baseGain + extraEp, STARTING_EVOLUTION_POINTS);
    const startEffects = executeStartOfTurnAbilities({
      field,
      ep: currentEp,
      epForThresholdAbilities: epAfterStartIncome,
    });
    const additionalEp = startEffects?.effects?.ep || 0;
    const drawAmount = startEffects?.effects?.draw || 0;
    
    setEvolutionPoints((ep) => Math.min(ep + baseGain + extraEp + additionalEp, STARTING_EVOLUTION_POINTS));
    if (drawAmount > 0) drawCards(drawAmount);

    setPlayerHasStartedTurn(true);
    setPlayerHasDrawnThisTurn(false);

    setTurnUpkeepLines(
      buildTurnUpkeepLines({
        baseGain,
        hasNationalInfrastructure,
        hasReactiveShield,
        reactiveShieldAmount: REACTIVE_SHIELD_AMOUNT,
        startEffects,
        additionalEp,
        drawAmount,
      })
    );
    setTurnUpkeepOpen(true);

    if (isSyncedMatch && matchId) {
      void mergeGameState(matchId, (next) => {
        const key = playerSlot === 1 ? 'player1' : 'player2';
        next[key] = {
          ...next[key],
          evolutionPoints: Math.min((next[key].evolutionPoints ?? 0) + baseGain + extraEp + additionalEp, STARTING_EVOLUTION_POINTS),
          shield: hasReactiveShield ? REACTIVE_SHIELD_AMOUNT : 0,
          usedEmergencyHealthcareActThisTurn: false,
        };
        return next;
      }).then((merged) => {
        if (merged) setMetaState(merged);
      });
    }
    bumpTurnTimer();
  }, [isSyncedMatch, playerSlot, matchId, economyField, field, evolutionPoints, me, drawCards, bumpTurnTimer]);

  const handleStartTurnClick = useCallback(() => {
    if (!isSyncedMatch && turn === 'opponent') {
      if (matchId === 'test') playSound('yourTurn', soundMuted);
      setTurn('player');
      setPlayerHasStartedTurn(false);
      startTurn();
      return;
    }
    if (playerHasStartedTurn) return;
    if (isSyncedMatch && metaState && metaState.turn !== playerSlot) return;
    startTurn();
  }, [isSyncedMatch, turn, matchId, soundMuted, startTurn, playerHasStartedTurn, metaState, playerSlot]);

  handleStartTurnClickRef.current = handleStartTurnClick;

  useEffect(() => {
    if (!needsStartTurnCountdown) return undefined;
    setStartTurnTimeRemaining(TURN_TIMER_SECONDS);
    const id = setInterval(() => {
      setStartTurnTimeRemaining((s) => {
        if (s <= 0) return 0;
        if (s <= 1) {
          queueMicrotask(() => handleStartTurnClickRef.current());
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [needsStartTurnCountdown]);

  useEffect(() => {
    if (isSyncedMatch && metaState?.turn === playerSlot) setPlayerHasStartedTurn(false);
  }, [isSyncedMatch, metaState?.turn, playerSlot]);

  const prevGameOverRef = useRef(null);
  useEffect(() => {
    if (!gameOver) {
      prevGameOverRef.current = null;
      return;
    }
    if (!playerSlot || prevGameOverRef.current === gameOver) return;
    prevGameOverRef.current = gameOver;
    playSound(gameOver.winner === playerSlot ? 'win' : 'lose', soundMuted);
  }, [gameOver, playerSlot, soundMuted]);

  useEffect(() => {
    if (!gameOver) setGameOverOverlayDismissed(false);
  }, [gameOver]);

  const prevSyncedTurnRef = useRef(null);
  useEffect(() => {
    if (!isSyncedMatch || view !== 'game' || !metaState || !playerSlot) return;
    const t = metaState.turn;
    const prev = prevSyncedTurnRef.current;
    prevSyncedTurnRef.current = t;
    if (prev != null && prev !== playerSlot && t === playerSlot) {
      playSound('yourTurn', soundMuted);
    }
  }, [isSyncedMatch, metaState?.turn, playerSlot, view, soundMuted]);

  const performEvolve = useCallback(() => {
    const [rawA, rawB] = evolutionSlots;
    if (rawA == null || rawB == null) return;

    const a = stripEvolutionSlotMeta(rawA);
    const b = stripEvolutionSlotMeta(rawB);

    const aEconomy = isEconomyCard(a);
    const bEconomy = isEconomyCard(b);
    if (aEconomy !== bEconomy) return;

    if (aEconomy && bEconomy) {
      const effectA = a.effect ?? getEconomyCardById(a.id)?.effect ?? '';
      const effectB = b.effect ?? getEconomyCardById(b.id)?.effect ?? '';
      const combinedEffect = [effectA, effectB].filter(Boolean).join('\n\n');
      const evolved = {
        id: `evolved-econ-${a.id}-${b.id}-${Date.now()}`,
        name: `Evolved ${a.name}`,
        playCost: computeEvolvedPlayCostFromTargetAndBurn(a, b),
        effect: combinedEffect || 'Evolved economy.',
        cardType: 'economy',
        art: a.art ?? '/images/economy/e_national_infrastructure.png',
        instanceId: `evolved-econ-${Date.now()}`,
      };
      setEvolutionSlots([null, null]);
      setHand((h) => [...h, evolved]);
      setLastEvolvedCardInstanceId(evolved.instanceId);
      playSound('evolve', soundMuted);
      bumpTurnTimer();
      return;
    }

    /** Ability text for display / hooks; uses canonical character by id (not occupation's first card). */
    const getAbilityFromCard = (card) => {
      const base = getCharacterDesignById(card.id);
      if (base) return { abilityName: base.abilityName ?? 'Ability', abilityText: base.abilityText ?? '' };
      return { abilityName: card.abilityName ?? 'Evolved', abilityText: card.abilityText ?? '' };
    };

    // Resolve the full character details for standard library cards to get their true rarity and stats
    const resolveCard = (card) => {
      const base = getCharacterDesignById(card.id);
      if (base) {
        return {
          ...card,
          ...base,
          playCost: card.playCost ?? base.playCost,
          power: card.power ?? base.power ?? 0,
          health: card.health ?? base.health ?? 0,
        };
      }
      return card;
    };

    const resolvedA = resolveCard(a);
    const resolvedB = resolveCard(b);
    const targetAbility = getAbilityFromCard(resolvedA);
    const burnAbility = getAbilityFromCard(resolvedB);
    const inheritBurnAbility = Math.random() < 0.5;
    const sameAbility =
      (targetAbility.abilityText ?? '').trim() === (burnAbility.abilityText ?? '').trim() &&
      (targetAbility.abilityName ?? '').trim() === (burnAbility.abilityName ?? '').trim();
    const canAddBurnAbility =
      inheritBurnAbility &&
      !sameAbility &&
      Boolean((burnAbility.abilityText ?? '').trim() || (burnAbility.abilityName ?? '').trim());

    let abilityName = targetAbility.abilityName;
    let abilityText = targetAbility.abilityText;
    if (canAddBurnAbility) {
      abilityName = `${targetAbility.abilityName} · ${burnAbility.abilityName}`;
      abilityText = `${targetAbility.abilityText}\n\n${burnAbility.abilityText}`;
    }

    const evolvedPlayCost = computeEvolvedPlayCostFromTargetAndBurn(resolvedA, resolvedB);
    const rankA = normalizeDeckRarity(resolvedA.rarity, resolvedA.tier);
    const rankB = normalizeDeckRarity(resolvedB.rarity, resolvedB.tier);

    let nextRank = 'Tier 1';
    if (rankA === 'basic' && rankB === 'basic') {
      nextRank = 'Tier 2';
    } else if (rankA === 'advanced' || rankB === 'advanced') {
      nextRank = 'Tier 3';
    } else {
      nextRank = 'Tier 3'; // Max base tier for generic evolution
    }

    const gender = Math.random() < 0.5 ? 'male' : 'female';
    // Tier from evolution color when set; else base tier (Tier 1=1, Tier 2=2, Tier 3=3)
    const sourceTier = resolvedA.evolution_color_id
      ? (getTierFromColorId(resolvedA.evolution_color_id) ?? 1)
      : deckTierFromNormalizedRarity(normalizeDeckRarity(resolvedA.rarity, resolvedA.tier));
    const evolvedTier = Math.min(sourceTier + 1, 9);
    const evolved = {
      id: `evolved-${a.id}-${b.id}-${Date.now()}`,
      name: resolvedA.name,
      tier: evolvedTier,
      rarity: nextRank,
      playCost: evolvedPlayCost,
      power: (resolvedA.power ?? 0) + (resolvedB.power ?? 0),
      health: (resolvedA.health ?? 0) + (resolvedB.health ?? 0),
      abilityName,
      abilityText,
      instanceId: `evolved-${Date.now()}`,
      gender,
      portrait: resolvedA.portrait,
      isEvolved: true,
      evolution_color_id: getTierColorId(evolvedTier),
    };

    const legacyDraws = countMasterCraftspersonInEvolutionSlots(a, b);
    const maxLegacyDraw = Math.min(
      legacyDraws,
      Math.max(0, MAX_PLAYER_HAND - hand.length - 1),
      deckRef.current?.length ?? 0
    );
    if (maxLegacyDraw > 0) {
      drawCards(maxLegacyDraw);
      setAttackToast({
        message: `Legacy: Drew ${maxLegacyDraw} card${maxLegacyDraw === 1 ? '' : 's'}.`,
        key: Date.now(),
      });
    }

    setEvolutionSlots([null, null]);
    setHand((h) => [...h, evolved]);
    setLastEvolvedCardInstanceId(evolved.instanceId);
    playSound('evolve', soundMuted);
    bumpTurnTimer();
  }, [evolutionSlots, soundMuted, hand, drawCards, bumpTurnTimer]);

  const performAttack = useCallback(() => {
    if (attackSelection.length === 0) return;
    const attackers = field.filter((c) => attackSelection.includes(c.instanceId || c.id));
    const totalPower = attackers.reduce((sum, c) => sum + getCardPower(c, field), 0);
    if (totalPower <= 0) {
      setAttackSelection([]);
      return;
    }
    if (isSyncedMatch && matchId) {
      void mergeGameState(matchId, (next) => {
        const oppKey = playerSlot === 1 ? 'player2' : 'player1';
        const opp = next[oppKey];
        const econ = Array.isArray(opp.economyField) ? opp.economyField : [];
        const alreadyHc = opp.usedEmergencyHealthcareActThisTurn === true;
        const { damage: effDamage, consumedHealthcare } = resolveIncomingDamageWithEmergencyHealthcare(
          totalPower,
          econ,
          alreadyHc
        );
        const { health: oh, shield: os } = applyPlayerDamage(
          opp.health ?? STARTING_HEALTH,
          opp.shield ?? 0,
          effDamage
        );
        opp.health = oh;
        opp.shield = os;
        if (consumedHealthcare) opp.usedEmergencyHealthcareActThisTurn = true;
        if (opp.health <= 0) next.gameOver = { winner: playerSlot };
        return next;
      }).then((merged) => {
        if (merged) setMetaState(merged);
      });
    } else {
      const { damage: effDamage, consumedHealthcare } = resolveIncomingDamageWithEmergencyHealthcare(
        totalPower,
        localOpponentEconomyField,
        localOpponentUsedHealthcareThisTurn
      );
      if (consumedHealthcare) setLocalOpponentUsedHealthcareThisTurn(true);
      const { health: oh, shield: os } = applyPlayerDamage(
        localOpponentHealth,
        localOpponentShield,
        effDamage
      );
      setLocalOpponentHealth(oh);
      setLocalOpponentShield(os);
      if (oh <= 0) setLocalGameOver({ winner: playerSlot });
    }
    setAttackedThisTurn((prev) => [...prev, ...attackSelection]);
    setAttackSelection([]);
    setHasAttackedThisTurn(true);
    playSound('attack', soundMuted);
    setAttackToast({ message: `You dealt ${totalPower} damage to the opponent!`, key: Date.now() });
    bumpTurnTimer();
  }, [
    attackSelection,
    field,
    isSyncedMatch,
    localOpponentHealth,
    localOpponentShield,
    localOpponentEconomyField,
    localOpponentUsedHealthcareThisTurn,
    playerSlot,
    matchId,
    soundMuted,
    bumpTurnTimer,
  ]);

  const canAffordSlotCost = Boolean(selectedCard && epForCost >= (selectedCard.playCost ?? 1));

  const hasBlackMarket = economyField.some((c) => c.id === 'black-market-exchange');
  const canUseBlackMarket = canAct && hasBlackMarket && hand.length > 0 && !usedBlackMarketThisTurn;
  const handleActivateAbility = useCallback(() => {
    if (!selectedFieldId) return;
    const card = field.find((c) => (c.instanceId || c.id) === selectedFieldId);
    if (!card) return;
    
    const info = getManualAbilityInfo(card);
    if (!info) return;

    const currentEp = isSyncedMatch && me ? me.evolutionPoints : evolutionPoints;
    if (currentEp < info.cost) return;

    if (info.needsDiscard) {
      setAbilityDiscardSelectingId(selectedFieldId);
      return;
    }

    applyGameStateChanges({ ep: -info.cost });
    const result = executeManualAbility(card, { field, economyField });
    if (result) {
      applyGameStateChanges(result.effects);
      if (result.message) setAttackToast({ message: result.message, key: Date.now() });
    }
    setUsedAbilitiesThisTurn((prev) => [...prev, selectedFieldId]);
    setSelectedFieldId(null);
  }, [selectedFieldId, field, economyField, isSyncedMatch, me, evolutionPoints, applyGameStateChanges]);

  const handleAbilityDiscard = useCallback((cardToDiscard) => {
    if (!abilityDiscardSelectingId || !cardToDiscard) return;
    const card = field.find((c) => (c.instanceId || c.id) === abilityDiscardSelectingId);
    if (!card) return;

    const info = getManualAbilityInfo(card);
    if (!info) return;

    // Discard logic
    setHand((h) => h.filter((c) => (c.instanceId || c.id) !== (cardToDiscard.instanceId || cardToDiscard.id)));
    
    applyGameStateChanges({ ep: -info.cost });
    const result = executeManualAbility(card, { field, economyField });
    if (result) {
      applyGameStateChanges(result.effects);
      if (result.message) setAttackToast({ message: result.message, key: Date.now() });
    }
    setUsedAbilitiesThisTurn((prev) => [...prev, abilityDiscardSelectingId]);
    setAbilityDiscardSelectingId(null);
    setSelectedFieldId(null);
  }, [abilityDiscardSelectingId, field, economyField, applyGameStateChanges]);

  const handleBlackMarketDiscard = useCallback((card) => {
    if (!blackMarketSelecting || !card) return;
    setHand((h) => h.filter((c) => (c.instanceId || c.id) !== (card.instanceId || card.id)));
    setUsedBlackMarketThisTurn(true);
    setBlackMarketSelecting(false);
    setEvolutionPoints((ep) => Math.min(ep + 2, STARTING_EVOLUTION_POINTS));
    if (isSyncedMatch && matchId) {
      void mergeGameState(matchId, (next) => {
        const key = playerSlot === 1 ? 'player1' : 'player2';
        next[key] = {
          ...next[key],
          evolutionPoints: Math.min((next[key].evolutionPoints ?? 0) + 2, STARTING_EVOLUTION_POINTS),
        };
        return next;
      }).then((merged) => {
        if (merged) setMetaState(merged);
      });
    }
  }, [blackMarketSelecting, isSyncedMatch, playerSlot, matchId]);

  if (view === 'lobby') {
    if (authEnabled && authInitializing) {
      return (
        <div className="auth-screen">
          <div className="auth-screen__card">
            <p className="auth-screen__subtitle" style={{ marginBottom: 0 }}>
              Loading…
            </p>
          </div>
        </div>
      );
    }
    if (authEnabled && !session) {
      return <AuthScreen />;
    }
    return (
      <Lobby
        onMatchFound={handleMatchFound}
        onStartTutorial={handleStartTutorial}
        onLogout={authEnabled ? handleLobbyLogout : undefined}
      />
    );
  }

  return (
    <div className={`app${screenShake ? ' app--screen-shake' : ''}`}>
      <aside className="app__left-sidebar" aria-label="Match sidebar">
        <div className="app__left-sidebar-stack">
          <ErrorBoundary>
            <MatchPlayersOnline matchId={matchId} playerSlot={playerSlot} isSyncedMatch={isSyncedMatch} />
          </ErrorBoundary>
          <div className="app__left-sidebar-chat-wrap">
            <ErrorBoundary>
              <ChatPanel matchId={matchId} playerSlot={playerSlot} />
            </ErrorBoundary>
          </div>
        </div>
      </aside>
      <div className="app__content">
      <header className="app__header">
        <div className="app__header-brand">
          <h1 className="app__title">Echoes of Evolution</h1>
          <p className="app__tagline">When the stars align</p>
        </div>
        <div className="app__header-toolbar">
          <div className="app__header-toolbar-left">
            <button
              type="button"
              className="app__settings-btn"
              onClick={() => setDeckBuilderOpen(true)}
              aria-label="Open deck builder"
            >
              Deck Builder
            </button>
            <button
              type="button"
              className="app__settings-btn"
              onClick={() => setRulesOpen(true)}
              aria-label="Open rules"
            >
              Rules
            </button>
            <button
              type="button"
              className="app__settings-btn"
              onClick={() => setAbilitiesOpen(true)}
              aria-label="Open abilities list"
            >
              Abilities
            </button>
            <ErrorBoundary>
              <CardSetDropdown
                onCardClick={(id) => {
                  setOccupationInfoId(id);
                  setOccupationInfoOpen(true);
                }}
              />
            </ErrorBoundary>
            <button
              type="button"
              className="app__settings-btn"
              onClick={() => setEvolveOpen(true)}
              aria-label="How evolving works"
            >
              Evolve
            </button>
            {matchId && isSyncedMatch && (
              <button
                type="button"
                className="app__leave-match-btn"
                onClick={handleLeaveMatch}
                aria-label="Leave match"
              >
                Leave match
              </button>
            )}
          </div>
          <div className="app__header-toolbar-center">
            <ColorPalette />
          </div>
          <div className="app__header-toolbar-right">
            <a
              className="app__settings-btn"
              href="https://discord.gg/UYTyvVxMTf"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Join Discord server"
            >
              Discord
            </a>
            <button
              type="button"
              className="app__settings-btn"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
            >
              Settings
            </button>
            <button
              type="button"
              className="app__profile-btn"
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile"
            >
              Profile
            </button>
          </div>
        </div>
      </header>

      <ErrorBoundary>
        <ProfileModal
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          onAfterSignOut={handleProfileSignOutReturnToLogin}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          theme={theme}
          onThemeChange={setTheme}
          soundMuted={soundMuted}
          onSoundMutedChange={setSoundMuted}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <OccupationInfoModal
          isOpen={occupationInfoOpen}
          onClose={() => setOccupationInfoOpen(false)}
          occupationId={occupationInfoId}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
      </ErrorBoundary>

      <ErrorBoundary>
        <AbilitiesModal isOpen={abilitiesOpen} onClose={() => setAbilitiesOpen(false)} />
      </ErrorBoundary>

      <ErrorBoundary>
        <EvolveModal isOpen={evolveOpen} onClose={() => setEvolveOpen(false)} />
      </ErrorBoundary>

      <ErrorBoundary>
        <DeckBuilderModal
          isOpen={deckBuilderOpen}
          onClose={() => setDeckBuilderOpen(false)}
          entries={savedCollectionEntries}
        />
      </ErrorBoundary>

      {cardSaveMenu && (
        <CardSaveContextMenu
          x={cardSaveMenu.x}
          y={cardSaveMenu.y}
          onSave={handleConfirmSaveCardFromMenu}
          onDismiss={handleDismissSaveCardMenu}
        />
      )}

      <ErrorBoundary>
        <TurnUpkeepModal
          isOpen={turnUpkeepOpen}
          onClose={() => setTurnUpkeepOpen(false)}
          lines={turnUpkeepLines}
        />
      </ErrorBoundary>

      {reconnectedJustNow && (
        <div className="app__reconnected" role="status" aria-live="polite">
          Reconnected — your game state was restored.
        </div>
      )}

      <main className="app__main">
        <div className="app__game">
          <aside className="app__deck">
            <Deck />
          </aside>
          <section
            className={`app__board${matchId === 'tutorial' ? ' app__board--tutorial' : ''}`}
          >
            {matchId === 'tutorial' && (
              <div className="app__tutorial-bar" role="group" aria-label="Tutorial actions">
                <button
                  type="button"
                  className="app__tutorial-board-btn"
                  onClick={handleLeaveMatch}
                  aria-label="Exit tutorial and return to lobby"
                >
                  Exit tutorial
                </button>
                <button
                  type="button"
                  className="app__tutorial-board-btn"
                  onClick={handleRestartTutorial}
                  aria-label="Restart tutorial from the beginning"
                >
                  Restart game
                </button>
              </div>
            )}
            <div className="app__board-row app__board-row--opponent">
              <div className="app__board-side-column">
                <BoardDeckPile label="Opponent deck" count={opponentBoardDeckCount} />
                <EconomyArea
                  cards={opponentEconomy}
                  selectedId={null}
                  onSelectCard={undefined}
                  label="Opponent Economy"
                  showHint={false}
                />
              </div>
              <div className="play-area-wrapper">
                {pendingEnterPlayTarget && (
                  <div className="app__target-prompt">
                    <span>
                      {pendingEnterPlayTarget.damage != null
                        ? `Select an opponent character to deal ${pendingEnterPlayTarget.damage} damage to`
                        : pendingEnterPlayTarget.heal != null
                          ? 'Choose a character to give +2 HP and Regenerate this turn'
                          : 'Choose a target'}
                    </span>
                    <button type="button" className="app__cancel-btn" onClick={() => setPendingEnterPlayTarget(null)}>
                      Cancel
                    </button>
                  </div>
                )}
                <PlayArea
                  cards={opponentField}
                  selectedId={null}
                  onSelectCard={pendingEnterPlayTarget ? handleEnterPlayTargetSelect : undefined}
                  emptyMessage="Opponent has no cards in play."
                  targetable={Boolean(pendingEnterPlayTarget)}
                />
              </div>
            </div>
            <div className="app__board-turn-indicator" role="status" aria-live="polite">
              <div className="app__board-turn-left">
                <div className="app__board-turn-text">
                  <span className="app__board-turn-who">{turnIndicator.who}</span>
                  <span className="app__board-turn-action">{turnIndicator.action}</span>
                </div>
                {attackToast && (
                  <div className="app__board-turn-toast" aria-live="polite">
                    {attackToast.message}
                  </div>
                )}
              </div>
              <div
                className="app__board-turn-center"
                aria-label={
                  canAct ? 'Turn time remaining' : needsStartTurnCountdown ? 'Time to start turn' : undefined
                }
              >
                {canAct ? (
                  <>
                    <span className="app__turn-timer__label">Turn</span>
                    <span
                      className={
                        turnTimeRemaining <= 10
                          ? 'app__turn-timer__value app__turn-timer__value--warn'
                          : 'app__turn-timer__value'
                      }
                    >
                      {turnTimeRemaining}s
                    </span>
                  </>
                ) : needsStartTurnCountdown ? (
                  <>
                    <span className="app__turn-timer__label">Start</span>
                    <span
                      className={
                        startTurnTimeRemaining <= 10
                          ? 'app__turn-timer__value app__turn-timer__value--warn'
                          : 'app__turn-timer__value'
                      }
                    >
                      {startTurnTimeRemaining}s
                    </span>
                  </>
                ) : (
                  <span className="app__turn-timer__idle">—</span>
                )}
              </div>
              <DiceTracks
                health={displayHealth}
                shield={displayShield}
                evolutionPoints={displayEp}
                opponentHealth={displayOpponentHealth}
                opponentShield={displayOpponentShield}
                opponentEvolutionPoints={displayOpponentEp}
              />
            </div>
            <div className="app__board-row app__board-row--player">
              <div className="app__board-side-column">
                <div className="app__board-your-deck">
                  <BoardDeckPile label="Your deck" count={deck.length} variant="player" />
                  <button
                    type="button"
                    className={`app__draw-btn app__draw-btn--board-deck${canClickDraw ? ' app__draw-btn--active' : ''}`}
                    onClick={draw}
                    disabled={!canClickDraw}
                    title={
                      playerHasDrawnThisTurn
                        ? 'Already drew this turn'
                        : !firstTurnDrawDone
                          ? 'Draw 4 cards (first turn only)'
                          : 'Draw one card this turn'
                    }
                  >
                    {firstTurnDrawDone ? 'Draw' : 'Draw 4'}
                  </button>
                </div>
                <EconomyArea
                  cards={economyField}
                  selectedId={selectedEconomyId}
                  onSelectCard={canAct ? selectEconomy : undefined}
                  label="Economy"
                  showHint={false}
                  onSaveEvolvedCard={handleRequestSaveEvolvedCard}
                />
              </div>
              <PlayArea
                cards={field}
                selectedId={selectedFieldId}
                onSelectCard={pendingEnterPlayTarget ? handleEnterPlayTargetSelect : selectField}
                emptyMessage="You have no cards in play."
                animatedCardId={lastPlayedCardInstanceId}
                attackSelectedIds={attackSelection}
                targetable={Boolean(pendingEnterPlayTarget?.heal)}
                onSaveEvolvedCard={handleRequestSaveEvolvedCard}
              />
            </div>
          </section>
        </div>
        <aside className="app__evolution-sidebar">
          <EvolutionArea
            slots={evolutionSlots}
            selectedHandId={selectedHandId}
            selectedFieldId={selectedFieldId}
            selectedEconomyId={selectedEconomyId}
            canAct={canAct}
            canAffordSlotCost={canAffordSlotCost}
            onPlaceInSlot={placeInEvolutionSlot}
            onReturnFromSlot={returnFromEvolutionSlot}
            onEvolve={performEvolve}
          />
        </aside>
      </main>

      <section className="app__bottom">
        <div className="app__bottom-main">
          <section className="app__actions">
            {showPracticeActionBar ? (
              <>
                {showLocalOpponentPhase && (
                  <span className="app__turn-label">
                    Opponent&apos;s turn
                  </span>
                )}
                <button
                  type="button"
                  className="app__play-btn"
                  onClick={playFromHand}
                  disabled={!canAct || !canPlayCard || blackMarketSelecting}
                  title={selectedHandId && !canAffordPlay ? `Need ${playCost} evolution points` : selectedHandId && !isEconomyCard(hand.find((c) => (c.instanceId || c.id) === selectedHandId)) && fieldFull ? 'Field is full (max 4 characters)' : undefined}
                >
                  Play selected card {selectedHandId ? `(${playCost})` : ''}
                </button>
                <button
                  type="button"
                  className="app__attack-btn"
                  onClick={performAttack}
                  disabled={!canAct || attackSelection.length === 0 || hasAttackedThisTurn}
                  title={hasAttackedThisTurn ? 'You can only attack once per turn' : attackSelection.length === 0 ? 'Select cards with power on your field to attack' : `Attack with ${attackSelection.length} card(s)`}
                >
                  Attack {attackSelection.length > 0 ? `(${attackSelection.reduce((sum, id) => sum + getCardPower(field.find((c) => (c.instanceId || c.id) === id), field), 0)} damage)` : ''}
                </button>
                {selectedCardManualAbilityInfo && !abilityDiscardSelectingId && (
                  <button
                    type="button"
                    className="app__play-btn"
                    onClick={handleActivateAbility}
                    disabled={!canAct || !canAffordManualAbility || hasUsedSelectedAbility}
                    title={hasUsedSelectedAbility ? 'Ability already used this turn' : selectedCardManualAbilityInfo.text}
                  >
                    Activate Ability {selectedCardManualAbilityInfo.cost > 0 ? `(${selectedCardManualAbilityInfo.cost})` : ''}
                  </button>
                )}
                {abilityDiscardSelectingId && (
                  <>
                    <span className="app__black-market-hint">Click a card in hand to discard for ability</span>
                    <button
                      type="button"
                      className="app__cancel-btn"
                      onClick={() => setAbilityDiscardSelectingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {canUseBlackMarket && !blackMarketSelecting && (
                  <button
                    type="button"
                    className="app__black-market-btn"
                    onClick={() => setBlackMarketSelecting(true)}
                    title="Discard 1 card from hand to gain +2 Evolution"
                  >
                    Black Market (+2 EP)
                  </button>
                )}
                {blackMarketSelecting && (
                  <>
                    <span className="app__black-market-hint">Click a card in hand to discard for +2 EP</span>
                    <button
                      type="button"
                      className="app__cancel-btn"
                      onClick={() => setBlackMarketSelecting(false)}
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className={`app__start-turn-btn${canClickStartTurn ? ' app__start-turn-btn--active' : ''}`}
                  onClick={handleStartTurnClick}
                  disabled={playerHasStartedTurn || startTurnBlockedByTutorialBot}
                  title={
                    startTurnBlockedByTutorialBot
                      ? 'Opponent is still taking their turn'
                      : !playerHasStartedTurn
                        ? 'Begin your turn (gain +2 evolution points, max 20)'
                        : 'Already started this turn'
                  }
                >
                  Start turn (+2)
                </button>
                <button
                  type="button"
                  className="app__end-turn-btn"
                  onClick={endTurn}
                  disabled={!canAct}
                  title="End your turn so the other player can take theirs"
                >
                  End turn
                </button>
              </>
            ) : (
              <div className="app__turn-message">
                <span className="app__turn-label">Opponent&apos;s turn</span>
              </div>
            )}
          </section>

          {showGameOverOverlay && (
            <div className="app__game-over" role="dialog" aria-live="polite" aria-modal="true" aria-labelledby="game-over-title">
              <div className="app__game-over-panel">
                <h2 id="game-over-title" className="app__game-over-title">
                  {gameOver.winner === playerSlot ? 'You win!' : 'You lose!'}
                </h2>
                <p className="app__game-over-sub">
                  {gameOver.winner === playerSlot ? 'Opponent health reached 0.' : 'Your health reached 0.'}
                </p>
                <div className="app__game-over-actions">
                  <button
                    type="button"
                    className="app__game-over-btn app__game-over-btn--secondary"
                    onClick={() => setGameOverOverlayDismissed(true)}
                  >
                    View game
                  </button>
                  <button type="button" className="app__game-over-btn" onClick={handleLeaveMatch}>
                    Back to lobby
                  </button>
                </div>
              </div>
            </div>
          )}

          <Hand
            cards={hand}
            selectedId={selectedHandId}
            onSelectCard={abilityDiscardSelectingId ? handleAbilityDiscard : blackMarketSelecting ? handleBlackMarketDiscard : (canAct ? selectHand : () => {})}
            onSaveEvolvedCard={handleRequestSaveEvolvedCard}
            disabled={!canAct && !blackMarketSelecting && !abilityDiscardSelectingId}
          />
        </div>
      </section>
      </div>
      {matchId === 'tutorial' && !tutorialDismissed && (
        <TutorialPanel
          stepIndex={tutorialStep}
          onStepChange={setTutorialStep}
          onExit={() => setTutorialDismissed(true)}
          playerDisplayName={tutorialPlayerDisplayName}
        />
      )}
    </div>
  );
}
