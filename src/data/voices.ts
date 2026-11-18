/**
 * Les six chanteurs. L'ordre du tableau va du plus grave au plus aigu.
 *
 * `grp` : 'h' = Katr Tet, le quatuor de voix graves ; 'f' = les deux voix
 *         aiguës, qui ne chantent qu'à six.
 *
 * Aurore a quitté le groupe en 2026 : sa tête (`alto.png`) reste
 * dans `src/assets/heads/` mais n'est plus référencée nulle part. Le nouveau
 * logo de Mathilde ne compte que six têtes.
 */

export const VOICE_IDS = ['basse', 'baryton', 'lead', 'tenor', 'mezzo', 'soprano'] as const;

export type VoiceId = (typeof VOICE_IDS)[number];

export interface Voice {
  id: VoiceId;
  /** Prénom du chanteur */
  name: string;
  /** Nom du pupitre, tel qu'affiché */
  label: string;
  grp: 'h' | 'f';
}

export const VOICES: Voice[] = [
  { id: 'basse', name: 'Valentin', label: 'Basse', grp: 'h' }, // logo KatréKatr Set : 2e tête du haut
  { id: 'baryton', name: 'Amédée', label: 'Baryton', grp: 'h' }, // 4e tête du haut
  { id: 'lead', name: 'Adrien', label: 'Lead', grp: 'h' }, // 3e tête du haut
  { id: 'tenor', name: 'Maurin', label: 'Ténor', grp: 'h' }, // 1re tête du haut
  { id: 'mezzo', name: 'Mathilde', label: 'Mezzo', grp: 'f' }, // rangée du bas, à droite
  { id: 'soprano', name: 'Naïs', label: 'Soprano', grp: 'f' }, // rangée du bas, à gauche
];

/** Ordre d'empilement : les hommes passent devant les femmes, comme sur l'affiche. */
export const ZORDER: VoiceId[] = ['mezzo', 'soprano', 'basse', 'tenor', 'lead', 'baryton'];

export const voiceById = (id: VoiceId): Voice => {
  const v = VOICES.find((x) => x.id === id);
  if (!v) throw new Error(`voix inconnue : ${id}`);
  return v;
};
