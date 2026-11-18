/**
 * Cadence sacrée : cadence plagale, quatre accords tenus. Écrite pour la
 * démonstration, dans un registre plus large que le tag.
 */

import { definirPiste } from './types';

export default definirPiste({
  id: 'sacre',
  nom: 'Cadence sacrée',
  meta: 'plagal · 54 bpm',
  bpm: 54,
  origine: 'Écrite pour la démonstration.',
  tie: 2,
  lines: {
    basse: 'F2:4 | D3:4 | Bb2:4 | C3:4',
    baryton: 'A3:4 | A3:4 | F3:4 | G3:4',
    lead: 'C4:4 | D4:4 | D4:4 | C4:4',
    tenor: 'F4:4 | F4:4 | Bb4:4 | G4:4',
    mezzo: 'C5:4 | D5:4 | D5:4 | C5:4',
    soprano: 'F5:4 | F5:4 | Bb5:4 | G5:4',
  },
});
