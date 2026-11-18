/**
 * Evening Rise : sept lignes de 4 mesures en la mineur, sur Am, Dm, C, Am.
 *
 * ⚠ Reconstruction plausible, pas l'arrangement du groupe.
 */

import { definirPiste } from './types';

export default definirPiste({
  id: 'evening',
  nom: 'Evening Rise',
  meta: 'trad. · 76 bpm',
  bpm: 76,
  origine:
    'Traditionnel, compositeur inconnu, généralement traité comme domaine public. ' +
    "Reconstruction plausible en la mineur, pas l'arrangement du groupe.",
  tie: 0,
  lines: {
    basse: 'A2:2 E3:2 | D3:2 A2:2 | C3:2 G2:2 | A2:3 E3',
    baryton: 'A3:2 C4:2 | A3:2 F3:2 | G3:2 E3:2 | A3:4',
    lead: 'E4 E4 C4:2 | D4 F4 A4:2 | G4 E4 C4 D4 | E4:2 A3:2',
    tenor: 'A4:2 E4:2 | F4:2 A4:2 | G4:2 C5:2 | A4:4',
    alto: 'C5:3 A4 | A4:3 F4 | G4:3 E4 | A4:4',
    mezzo: 'E5:4 | D5:4 | C5:4 | E5:2 C5:2',
    soprano: 'A5:2 E5:2 | F5:2 D5:2 | E5:2 G5:2 | A5:4',
  },
});
