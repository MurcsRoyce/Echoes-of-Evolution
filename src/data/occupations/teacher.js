/**
 * TEACHER — Full occupation design for Echoes of Evolution
 * Theme: Guide and inspire. Education, mentorship, growth.
 * Portrait images: public/images/teacher/male/ and public/images/teacher/female/
 * Same layout as Doctor: teacher_common_m.png, teacher_common_w.png, etc.
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

export const TEACHER_DESIGN = {
  id: 'teacher',
  name: 'Teacher',
  icon: '📚',

  theme: 'Guide and inspire. Education, mentorship, growth',
  strengths: 'Drawn cards, buffing allies, knowledge payoff',
  weakness: 'Needs setup, low early pressure',
  riskAxis: 'Empower others vs. hoard knowledge',
  quote: 'Teachers win by making everyone around them stronger.',

  baseCharacters: [
    character(
      'student-teacher',
      'Student Teacher',
      RARITY.BASIC,
      1,
      2,
      2,
      2,
      'Lesson Plan',
      'When this character enters play, draw 1 card.',
      null,
      '/images/teacher/male/teacher_common_m.png'
    ),
    character(
      'substitute-teacher',
      'Substitute Teacher',
      RARITY.BASIC,
      1,
      3,
      3,
      1,
      'Fill In',
      'At the end of your turn, you may give another friendly character +1 Power until end of turn.',
      null,
      '/images/teacher/female/teacher_common_w.png'
    ),
    character(
      'department-head',
      'Department Head',
      RARITY.ADVANCED,
      1,
      2,
      4,
      5,
      'Curriculum',
      'When this character enters play, draw a card for each other Teacher you control.',
      null,
      '/images/teacher/male/teacher_uncommon_m.png'
    ),
    character(
      'guidance-counselor',
      'Guidance Counselor',
      RARITY.ADVANCED,
      1,
      2,
      2,
      4,
      'Mentor',
      'Once per turn, when a friendly character would take damage, you may prevent 1 of it.',
      null,
      '/images/teacher/female/teacher_uncommon_w.png'
    ),
    character(
      'professor',
      'Professor',
      RARITY.RARE,
      1,
      7,
      7,
      5,
      'Tenure',
      'Your other Teacher characters have +1 Health.',
      null,
      '/images/teacher/male/teacher_rare_m.png'
    ),
    character(
      'principal',
      'Principal',
      RARITY.RARE,
      1,
      6,
      6,
      7,
      'Authority',
      'When this character enters play, draw 2 cards and gain 1 evolution point.',
      null,
      '/images/teacher/female/teacher_rare_w.png'
    ),
  ],
};


