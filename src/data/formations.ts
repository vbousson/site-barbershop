/**
 * Les formations programmables, côté plateau.
 *
 * Le texte éditorial vit dans `src/content/formations.yaml` ; ici on ne garde
 * que ce qui pilote le widget : qui est sur scène et où.
 *
 * Depuis novembre 2026 l'ensemble est à six et s'appelle KatréKatr Set
 * (« quatre et quatre, sept », en lettres, à prononcer à voix haute). Le nom
 * chapeau vaut pour la géométrie variable : à six, à quatre voix graves avec
 * Katr Tet, à trois voix hautes. Une configuration sans nom à elle porte le
 * nom chapeau.
 *
 * « 4+4=7 » en chiffres, c'est la configuration à sept, qui a existé jusqu'au
 * départ d'Aurore. Elle reste sur le plateau, dans les onglets « Avant », avec
 * le Quatuor à une barbe : on veut qu'un visiteur voie toutes les formes que
 * l'ensemble a prises, et les concerts passés restent rattachés à la
 * configuration qui les a vraiment chantés.
 *
 * Les identifiants sont ceux des URL : pas d'accent, ni `+` ni `=`.
 */

import type { VoiceId } from './voices';
import { ZORDER } from './voices';
import { GEOM_KKS, GEOM_KT, type FormationGeom } from './geometry';

export const FORMATION_IDS = [
  'katrekatr-set',
  'katr-tet',
  'voix-hautes',
  '4plus4',
  'quatuor-a-une-barbe',
] as const;
export type FormationId = (typeof FORMATION_IDS)[number];

export interface Formation extends FormationGeom {
  id: FormationId;
  /** Nom court affiché sur l'onglet */
  tab: string;
  /** Effectif, affiché en second sur l'onglet */
  effectif: string;
  members: VoiceId[];
  /** Configuration passée : rangée « Avant » du plateau, repliée par défaut. */
  passee?: boolean;
  /**
   * Voix qui passent devant les autres. Par défaut les hommes sont devant,
   * comme sur l'affiche de juillet ; sur le logo de novembre, Naïs et
   * Mathilde sont au premier rang, et un homme devant elles leur prendrait
   * le visage (et le clic).
   */
  devant?: VoiceId[];
}

export const FORMATIONS: Record<FormationId, Formation> = {
  // Le nouveau logo de Mathilde, tout le monde sur scène.
  'katrekatr-set': {
    id: 'katrekatr-set',
    tab: 'KatréKatr Set',
    effectif: '6 voix',
    geom: GEOM_KKS,
    members: ZORDER.filter((v) => v !== 'alto'),
    devant: ['soprano', 'mezzo'],
    mark: { kind: 'img', asset: 'set', ...GEOM_KKS.mark },
  },

  // Le quatuor de voix graves reprend la géométrie de son propre logo.
  'katr-tet': {
    id: 'katr-tet',
    tab: 'Katr Tet',
    effectif: '4 voix',
    geom: GEOM_KT,
    members: ['basse', 'tenor', 'lead', 'baryton'],
    mark: { kind: 'img', asset: 'kt', ...GEOM_KT.mark },
  },

  // Les trois voix hautes, glissées dans les concerts à six. Pas de nom à
  // elles : l'onglet dit juste « Trois voix hautes », le disque garde le
  // logotype de l'ensemble (le nom chapeau). Pas de logo propre : centres
  // choisis à la main, la soprano au milieu, de l'air entre les trois.
  'voix-hautes': {
    id: 'voix-hautes',
    tab: 'Trois voix hautes',
    effectif: '3 voix',
    members: ['tenor', 'mezzo', 'soprano'],
    centres: {
      tenor: [22, 40],
      soprano: [50, 38],
      mezzo: [77.5, 42],
    },
    mark: { kind: 'img', asset: 'set', ...GEOM_KKS.mark },
  },

  // Avant : la configuration à sept, aux positions exactes de l'affiche de
  // juillet 2026.
  '4plus4': {
    id: '4plus4',
    tab: '4+4=7',
    effectif: '7 voix',
    passee: true,
    exact: true,
    members: ZORDER,
    mark: { kind: 'img', asset: 'sept', left: 26.214, top: 62.472, w: 46.468 },
  },

  // Avant : le quatuor de voix aiguës, Maurin sur la ligne d'alto. Pas de logo
  // existant : centres choisis à la main et logotype typographique.
  'quatuor-a-une-barbe': {
    id: 'quatuor-a-une-barbe',
    tab: 'Quatuor à une barbe',
    effectif: '4 voix',
    passee: true,
    members: ['tenor', 'alto', 'mezzo', 'soprano'],
    centres: {
      tenor: [19, 39],
      alto: [39.5, 31],
      soprano: [61.5, 29],
      mezzo: [81.5, 35],
    },
    mark: { kind: 'txt', lines: ['Quatuor', 'à\u00A0une\u00A0barbe'], left: 12, top: 55, w: 76, fs: 9.9 },
  },
};

export const FORMATION_LIST: Formation[] = FORMATION_IDS.map((id) => FORMATIONS[id]);
export const FORMATIONS_ACTUELLES = FORMATION_LIST.filter((f) => !f.passee);
export const FORMATIONS_PASSEES = FORMATION_LIST.filter((f) => f.passee);

/** La formation par défaut : celle du logo, tout le monde sur scène. */
export const DEFAULT_FORMATION: FormationId = 'katrekatr-set';
