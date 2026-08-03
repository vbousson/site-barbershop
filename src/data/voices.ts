/**
 * Les sept chanteurs. L'ordre du tableau va du plus grave au plus aigu.
 *
 * `grp` : 'h' = quatuor de voix graves, 'f' = quatuor de voix aiguës,
 *         'p' = le pivot, présent dans les deux.
 *
 * ⚠ À CONFIRMER (cf. BRIEF §7) : l'affectation des trois visages féminins.
 * Aurore est supposée être la femme de gauche sur l'affiche. Si c'est faux,
 * il suffit d'échanger les `id` entre les lignes concernées ici — l'image et
 * la géométrie suivent automatiquement, puisque tout est indexé par `id`.
 */

export const VOICE_IDS = [
  'basse',
  'baryton',
  'lead',
  'tenor',
  'alto',
  'mezzo',
  'soprano',
] as const;

export type VoiceId = (typeof VOICE_IDS)[number];

export interface Voice {
  id: VoiceId;
  /** Prénom du chanteur */
  name: string;
  /** Nom du pupitre, tel qu'affiché */
  label: string;
  grp: 'h' | 'f' | 'p';
  /** Chante dans les deux quatuors : c'est lui, l'arithmétique du nom */
  pivot?: boolean;
}

export const VOICES: Voice[] = [
  { id: 'basse', name: 'Valentin', label: 'Basse', grp: 'h' }, // logo Katr Tet : 1re tête
  { id: 'baryton', name: 'Amédée', label: 'Baryton', grp: 'h' }, // logo Katr Tet : 4e tête
  { id: 'lead', name: 'Adrien', label: 'Lead', grp: 'h' }, // logo Katr Tet : 3e tête
  { id: 'tenor', name: 'Maurin', label: 'Ténor', grp: 'p', pivot: true }, // logo Katr Tet : 2e tête
  { id: 'alto', name: 'Aurore', label: 'Alto', grp: 'f' }, // affiche : femme de gauche — à confirmer
  { id: 'mezzo', name: 'Mathilde', label: 'Mezzo', grp: 'f' }, // affiche : femme de droite
  { id: 'soprano', name: 'Naïs', label: 'Soprano', grp: 'f' }, // affiche : femme du milieu
];

/** Ordre d'empilement : les hommes passent devant les femmes, comme sur l'affiche. */
export const ZORDER: VoiceId[] = [
  'alto',
  'mezzo',
  'soprano',
  'basse',
  'tenor',
  'lead',
  'baryton',
];

export const voiceById = (id: VoiceId): Voice => {
  const v = VOICES.find((x) => x.id === id);
  if (!v) throw new Error(`voix inconnue : ${id}`);
  return v;
};
