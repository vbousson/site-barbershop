/**
 * Les six chanteurs. L'ordre du tableau va du plus grave au plus aigu.
 *
 * `grp` : 'h' = Katr Tet, le quatuor de voix graves ; 'f' = les voix aiguës.
 *
 * `ancienne` : a quitté le groupe. La voix reste dans le tableau parce que les
 * configurations passées (onglets « Avant ») la font encore monter sur scène,
 * et que les boucles audio gardent sa ligne pour elles. Aurore est partie en
 * novembre 2026 ; Léa, qui tenait l'alto avant elle, n'a pas encore de
 * caricature.
 */

export const VOICE_IDS = ['basse', 'baryton', 'lead', 'tenor', 'alto', 'mezzo', 'soprano'] as const;

export type VoiceId = (typeof VOICE_IDS)[number];

export interface Voice {
  id: VoiceId;
  /** Prénom du chanteur */
  name: string;
  /** Nom du pupitre, tel qu'affiché */
  label: string;
  grp: 'h' | 'f';
  ancienne?: boolean;
}

export const VOICES: Voice[] = [
  { id: 'basse', name: 'Valentin', label: 'Basse', grp: 'h' }, // logo KatréKatr Set : 2e tête du haut
  { id: 'baryton', name: 'Amédée', label: 'Baryton', grp: 'h' }, // 4e tête du haut
  { id: 'lead', name: 'Adrien', label: 'Lead', grp: 'h' }, // 3e tête du haut
  { id: 'tenor', name: 'Maurin', label: 'Ténor', grp: 'h' }, // 1re tête du haut
  { id: 'alto', name: 'Aurore', label: 'Alto', grp: 'f', ancienne: true }, // affiche de juillet 2026 : femme de gauche
  { id: 'mezzo', name: 'Mathilde', label: 'Mezzo', grp: 'f' }, // rangée du bas, à droite
  { id: 'soprano', name: 'Naïs', label: 'Soprano', grp: 'f' }, // rangée du bas, à gauche
];

/** Ordre d'empilement : les hommes passent devant les femmes, comme sur l'affiche. */
export const ZORDER: VoiceId[] = ['alto', 'mezzo', 'soprano', 'basse', 'tenor', 'lead', 'baryton'];

export const voiceById = (id: VoiceId): Voice => {
  const v = VOICES.find((x) => x.id === id);
  if (!v) throw new Error(`voix inconnue : ${id}`);
  return v;
};
