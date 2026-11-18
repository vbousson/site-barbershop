/**
 * Tag barbershop : quatre accords tenus, une mesure chacun. Écrit pour la
 * démonstration : c'est la boucle où l'empilement des six voix s'entend le
 * mieux, puisque rien ne bouge par ailleurs.
 */

import { definirPiste } from './types';

export default definirPiste({
  id: 'tag',
  nom: 'Tag barbershop',
  meta: 'accord tenu · 60 bpm',
  bpm: 60,
  origine: 'Écrit pour la démonstration.',
  tie: 1,
  lines: {
    basse: 'F2:4 | D3:4 | G2:4 | C3:4',
    baryton: 'A3:4 | F#3:4 | B3:4 | E3:4',
    lead: 'C4:4 | A3:4 | D4:4 | G3:4',
    tenor: 'F4:4 | A4:4 | F4:4 | Bb4:4',
    mezzo: 'C5:4 | A4:4 | D5:4 | G4:4',
    soprano: 'F5:4 | C5:4 | F5:4 | E5:4',
  },
});
