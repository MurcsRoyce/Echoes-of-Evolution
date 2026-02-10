import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const STARTING_HEALTH = 30;
const STARTING_EVOLUTION_ENERGY = 3;

const ENCOUNTERS = [
  'Ancient ruins revealed: draw 1 extra card this turn.',
  'Solar storm: abilities cost +1 energy until next turn.',
  'Adaptation surge: choose one creature to gain +2 power.',
  'Echo resonance: both players recover 2 health.',
  'Time fracture: skip battle phase this turn.',
];

type PlayerKey = 'one' | 'two';

type PlayerPanelProps = {
  name: string;
  health: number;
  onAdjustHealth: (delta: number) => void;
};

function PlayerPanel({ name, health, onAdjustHealth }: PlayerPanelProps) {
  return (
    <View style={styles.playerPanel}>
      <Text style={styles.playerName}>{name}</Text>
      <Text style={styles.healthValue}>{health}</Text>
      <View style={styles.buttonRow}>
        <ActionButton label="-5" onPress={() => onAdjustHealth(-5)} />
        <ActionButton label="-1" onPress={() => onAdjustHealth(-1)} />
        <ActionButton label="+1" onPress={() => onAdjustHealth(1)} />
        <ActionButton label="+5" onPress={() => onAdjustHealth(5)} />
      </View>
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
};

function ActionButton({ label, onPress }: ActionButtonProps) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

function clampAtZero(value: number) {
  return Math.max(0, value);
}

export default function App() {
  const [playerOneHealth, setPlayerOneHealth] = useState(STARTING_HEALTH);
  const [playerTwoHealth, setPlayerTwoHealth] = useState(STARTING_HEALTH);
  const [turn, setTurn] = useState(1);
  const [evolutionEnergy, setEvolutionEnergy] = useState(STARTING_EVOLUTION_ENERGY);
  const [lastEncounter, setLastEncounter] = useState('Tap "New Encounter" to generate one.');
  const [notes, setNotes] = useState('');

  const totalHealth = useMemo(
    () => playerOneHealth + playerTwoHealth,
    [playerOneHealth, playerTwoHealth]
  );

  const adjustHealth = (player: PlayerKey, delta: number) => {
    if (player === 'one') {
      setPlayerOneHealth((value) => clampAtZero(value + delta));
      return;
    }
    setPlayerTwoHealth((value) => clampAtZero(value + delta));
  };

  const nextTurn = () => {
    setTurn((value) => value + 1);
    setEvolutionEnergy((value) => value + 1);
  };

  const spendEnergy = () => {
    setEvolutionEnergy((value) => clampAtZero(value - 1));
  };

  const newEncounter = () => {
    const index = Math.floor(Math.random() * ENCOUNTERS.length);
    setLastEncounter(ENCOUNTERS[index]);
  };

  const resetMatch = () => {
    setPlayerOneHealth(STARTING_HEALTH);
    setPlayerTwoHealth(STARTING_HEALTH);
    setTurn(1);
    setEvolutionEnergy(STARTING_EVOLUTION_ENERGY);
    setLastEncounter('Tap "New Encounter" to generate one.');
    setNotes('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Echoes of Evolution</Text>
        <Text style={styles.subtitle}>Phone companion for your tabletop sessions</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Battle Tracker</Text>
          <PlayerPanel
            name="Player One"
            health={playerOneHealth}
            onAdjustHealth={(delta) => adjustHealth('one', delta)}
          />
          <PlayerPanel
            name="Player Two"
            health={playerTwoHealth}
            onAdjustHealth={(delta) => adjustHealth('two', delta)}
          />
          <Text style={styles.metaText}>Combined Health Pool: {totalHealth}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Turn + Energy</Text>
          <View style={styles.turnRow}>
            <Text style={styles.turnText}>Turn {turn}</Text>
            <Text style={styles.turnText}>Energy {evolutionEnergy}</Text>
          </View>
          <View style={styles.buttonRow}>
            <ActionButton label="Next Turn" onPress={nextTurn} />
            <ActionButton label="Spend 1" onPress={spendEnergy} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>World Event</Text>
          <Text style={styles.encounterText}>{lastEncounter}</Text>
          <View style={styles.buttonRow}>
            <ActionButton label="New Encounter" onPress={newEncounter} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Notes</Text>
          <TextInput
            multiline
            style={styles.notesInput}
            placeholder="Track deck changes, key turns, or balancing ideas..."
            placeholderTextColor="#95a1d2"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <Pressable style={styles.resetButton} onPress={resetMatch}>
          <Text style={styles.resetButtonText}>Reset Match</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#12152a',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    gap: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#f5f7ff',
  },
  subtitle: {
    color: '#bcc7ff',
    fontSize: 14,
  },
  section: {
    borderRadius: 14,
    backgroundColor: '#1f2444',
    padding: 14,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f5f7ff',
  },
  playerPanel: {
    borderRadius: 10,
    backgroundColor: '#2a315d',
    padding: 12,
    gap: 10,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dfe5ff',
  },
  healthValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    borderRadius: 8,
    backgroundColor: '#4652a1',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    color: '#f3f6ff',
    fontWeight: '700',
  },
  metaText: {
    color: '#d4dcff',
    fontSize: 13,
  },
  turnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  turnText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  encounterText: {
    color: '#e9eeff',
    fontSize: 14,
    lineHeight: 20,
  },
  notesInput: {
    minHeight: 90,
    borderRadius: 10,
    borderColor: '#5160b7',
    borderWidth: 1,
    padding: 10,
    textAlignVertical: 'top',
    color: '#f5f7ff',
  },
  resetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#a23857',
    paddingVertical: 12,
  },
  resetButtonText: {
    color: '#fff4f8',
    fontSize: 15,
    fontWeight: '800',
  },
});
