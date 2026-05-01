/**
 * Occupation designs — full character design and base character cards per occupation.
 */

export { DOCTOR_DESIGN, RARITY } from './doctor';
export { ENGINEER_DESIGN } from './engineer';
export { FARMER_DESIGN } from './farmer';
export { TEACHER_DESIGN } from './teacher';
export { LAWYER_DESIGN } from './lawyer';
export { WORKER_DESIGN } from './worker';
export { SOLDIER_DESIGN } from './soldier';
export { MERCHANT_DESIGN } from './merchant';
export { BANKER_DESIGN } from './banker';
export { SCIENTIST_DESIGN } from './scientist';
export { ARTIST_DESIGN } from './artist';
export { JOURNALIST_DESIGN } from './journalist';
export { POLICE_OFFICER_DESIGN } from './police-officer';
export { POLITICIAN_DESIGN } from './politician';
export { ENTREPRENEUR_DESIGN } from './entrepreneur';

import { DOCTOR_DESIGN } from './doctor';
import { ENGINEER_DESIGN } from './engineer';
import { FARMER_DESIGN } from './farmer';
import { TEACHER_DESIGN } from './teacher';
import { LAWYER_DESIGN } from './lawyer';
import { WORKER_DESIGN } from './worker';
import { SOLDIER_DESIGN } from './soldier';
import { MERCHANT_DESIGN } from './merchant';
import { BANKER_DESIGN } from './banker';
import { SCIENTIST_DESIGN } from './scientist';
import { ARTIST_DESIGN } from './artist';
import { JOURNALIST_DESIGN } from './journalist';
import { POLICE_OFFICER_DESIGN } from './police-officer';
import { POLITICIAN_DESIGN } from './politician';
import { ENTREPRENEUR_DESIGN } from './entrepreneur';

/** All occupation designs for deck building and iteration. */
export const ALL_OCCUPATION_DESIGNS = [
  DOCTOR_DESIGN,
  ENGINEER_DESIGN,
  FARMER_DESIGN,
  TEACHER_DESIGN,
  LAWYER_DESIGN,
  WORKER_DESIGN,
  SOLDIER_DESIGN,
  MERCHANT_DESIGN,
  BANKER_DESIGN,
  SCIENTIST_DESIGN,
  ARTIST_DESIGN,
  JOURNALIST_DESIGN,
  POLICE_OFFICER_DESIGN,
  POLITICIAN_DESIGN,
  ENTREPRENEUR_DESIGN,
];

/** Returns full occupation design if we have one, else null (show simple sheet). */
export function getOccupationDesign(id) {
  if (id === 'doctor') return DOCTOR_DESIGN;
  if (id === 'engineer') return ENGINEER_DESIGN;
  if (id === 'farmer') return FARMER_DESIGN;
  if (id === 'teacher') return TEACHER_DESIGN;
  if (id === 'lawyer') return LAWYER_DESIGN;
  if (id === 'worker') return WORKER_DESIGN;
  if (id === 'soldier') return SOLDIER_DESIGN;
  if (id === 'merchant') return MERCHANT_DESIGN;
  if (id === 'banker') return BANKER_DESIGN;
  if (id === 'scientist') return SCIENTIST_DESIGN;
  if (id === 'artist') return ARTIST_DESIGN;
  if (id === 'journalist') return JOURNALIST_DESIGN;
  if (id === 'police-officer') return POLICE_OFFICER_DESIGN;
  if (id === 'politician') return POLITICIAN_DESIGN;
  if (id === 'entrepreneur') return ENTREPRENEUR_DESIGN;
  return null;
}
