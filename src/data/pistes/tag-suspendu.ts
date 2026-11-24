/**
 * Tag suspendu : le « hanger », procédé le plus reconnaissable du tag
 * barbershop. Une voix tient une note pendant que les autres bougent dessous,
 * et l'accord change de sens sans qu'elle bouge d'un demi-ton.
 *
 * Ici la note tenue est le ténor, c'est-à-dire Maurin. Il est le pivot des deux
 * quatuors, donc la seule voix qui ne bouge pas est aussi la seule qui chante
 * dans les deux : le procédé et l'arithmétique du nom disent la même chose.
 *
 * Bb6, Dm7, Gm7, F7, et la boucle repart sur Bb6 : le F7 final appelle le
 * premier accord, donc le raccord ne s'entend pas. Détail qui vaut le coup
 * d'oreille : Bb6 et Gm7 ont exactement les mêmes notes (Bb D F G / G Bb D F),
 * si bien que le quatuor aigu ne bouge pas entre la première et la troisième
 * mesure. C'est la basse seule qui redéfinit l'accord sous lui.
 *
 * Écrit pour la démonstration, sur un enchaînement d'usage. Cf. le README pour
 * la règle des deux quatuors superposés.
 */

import { definirPiste } from './types';

export default definirPiste({
  id: 'suspendu',
  nom: 'Tag suspendu',
  meta: 'note tenue · 52 bpm',
  bpm: 52,
  origine:
    "Écrit pour la démonstration. L'enchaînement est un tour d'harmonie " +
    "d'usage courant, pas la citation d'un arrangement existant.",
  tie: 3,
  lines: {
    basse: 'Bb2:4 | D3:4 | G2:4 | F2:3 C3',
    baryton: 'G3:4 | A3:4 | Bb3:4 | A3:4',
    lead: 'D4:4 | C4:4 | D4:4 | Eb4:4',
    tenor: 'F4:16',
    alto: 'G4:4 | A4:4 | G4:4 | A4:4',
    mezzo: 'Bb4:4 | C5:4 | Bb4:4 | C5:4',
    soprano: 'D5:4 | D5:4 | D5:4 | Eb5:4',
  },
});
