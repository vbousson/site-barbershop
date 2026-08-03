/**
 * Les visuels de Mathilde Varin, indexés par identifiant de voix.
 *
 * Ils sont découpés de l'affiche ; l'usage sur le site doit être couvert par
 * un accord avec elle, et idéalement les sources vectorielles récupérées
 * plutôt que ces découpes bitmap (cf. BRIEF §9).
 *
 * Le nommage suit l'identifiant de voix, jamais la position sur l'affiche :
 * `mezzo.png` est Mathilde, `soprano.png` est Naïs. L'appariement a été
 * corrigé une fois ; le figer dans le nom de fichier évite de le refaire.
 */

import type { VoiceId } from './voices';

import alto from '../assets/heads/alto.png';
import baryton from '../assets/heads/baryton.png';
import basse from '../assets/heads/basse.png';
import lead from '../assets/heads/lead.png';
import mezzo from '../assets/heads/mezzo.png';
import soprano from '../assets/heads/soprano.png';
import tenor from '../assets/heads/tenor.png';

import mark4plus4 from '../assets/marks/4plus4.png';
import markKatrTet from '../assets/marks/katrtet.png';

export const HEADS: Record<VoiceId, ImageMetadata> = {
  basse,
  baryton,
  lead,
  tenor,
  alto,
  mezzo,
  soprano,
};

export const MARKS = {
  /** Le logotype de l'affiche : 4+4=7 + « Ensemble vocal ». */
  sept: mark4plus4,
  /** Le logotype Katr Tet : « Barbershop » + KATR TÊT + filets. */
  kt: markKatrTet,
} as const;
