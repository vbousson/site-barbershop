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

import markKatrekatrSet from '../assets/marks/katrekatr-set.png';
import markKatrTet from '../assets/marks/katrtet.png';
import mark4plus4 from '../assets/marks/4plus4.png';

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
  /**
   * Le logotype KatréKatr Set + « Ensemble vocal » (novembre 2026).
   * ⚠ Provisoire : détouré d'une capture WhatsApp de ~440 px de large, en
   * attendant le fichier source de Mathilde.
   */
  set: markKatrekatrSet,
  /** Le logotype Katr Tet : « Barbershop » + KATR TÊT + filets. */
  kt: markKatrTet,
  /** Le logotype 4+4=7 de l'affiche de juillet 2026, la configuration à sept. */
  sept: mark4plus4,
} as const;
