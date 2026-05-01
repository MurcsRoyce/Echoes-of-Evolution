/**
 * ARTIST — Full occupation design for Echoes of Evolution
 * Theme: Imagine and express. Creativity, inspiration, and altering reality.
 * Portrait images: public/images/artist/male/ and public/images/artist/female/
 * (artist_common_*.png, artist_uncommon_*.png, artist_rare_*.png)
 */

import { RARITY } from './doctor';

const PLAY_COST_BY_RARITY = {
  [RARITY.BASIC]: 1,
  [RARITY.ADVANCED]: 3,
  [RARITY.RARE]: 5,
};

const character = (id, name, rarity, tier, energy, power, health, abilityName, abilityText, purpose = null, portrait = null) => ({
  id,
  name,
  rarity,
  tier,
  energy,
  power,
  health,
  abilityName,
  abilityText,
  purpose,
  playCost: PLAY_COST_BY_RARITY[rarity] ?? 1,
  portrait,
});

export const ARTIST_DESIGN = {
  id: 'artist',
  name: 'Artist',
  icon: '🎨',

  theme: 'Imagine and express. Creativity, inspiration, and altering reality.',
  strengths: 'Flexibility, cost reduction, misdirection',
  weakness: 'Low base stats, relies on combos',
  riskAxis: 'Inspiring hope vs. creating delusions',
  quote: 'Reality is just a canvas waiting for a better idea.',

  baseCharacters: [
    character(
      'apprentice',
      'Apprentice',
      RARITY.BASIC,
      1,
      1,
      3,
      3,
      'Sketch',
      'When this character enters play, look at the top card of your deck. You may put it on the bottom.',
      null,
      '/images/artist/male/artist_common_m.png'
    ),
    character(
      'street-artist',
      'Street Artist',
      RARITY.BASIC,
      1,
      1,
      1,
      3,
      'Graffiti',
      'When this character attacks, it cannot be targeted by abilities next turn.',
      null,
      '/images/artist/female/artist_common_w.png'
    ),
    character(
      'painter',
      'Painter',
      RARITY.ADVANCED,
      1,
      2,
      5,
      3,
      'Masterpiece',
      'Once per turn, you may pay 1 evolution point to give another character +1 power and +1 health until end of turn.',
      null,
      '/images/artist/male/artist_uncommon_m.png'
    ),
    character(
      'sculptor',
      'Sculptor',
      RARITY.ADVANCED,
      1,
      3,
      3,
      5,
      'Monument',
      'Friendly characters adjacent to this one cost 1 less evolution point to evolve.',
      null,
      '/images/artist/female/artist_uncommon_w.png'
    ),
    character(
      'visionary',
      'Visionary',
      RARITY.RARE,
      1,
      6,
      6,
      6,
      'Inspiration',
      'When you evolve a character, gain 1 evolution point and draw 1 card.',
      null,
      '/images/artist/male/artist_rare_m.png'
    ),
    character(
      'illusionist',
      'Illusionist',
      RARITY.RARE,
      1,
      7,
      7,
      4,
      'Mirage',
      'When an opponent attacks, you may discard 1 card to cancel that attack.',
      null,
      '/images/artist/female/artist_rare_w.png'
    ),
  ],
};


