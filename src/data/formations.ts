/**
 * Les formations programmables, côté plateau.
 *
 * Le texte éditorial vit dans `src/content/formations.yaml` ; ici on ne garde
 * que ce qui pilote le widget : qui est sur scène et où.
 *
 * Depuis novembre 2026 l'ensemble est à six et s'appelle KatréKatr Set
 * (« quatre et quatre, sept », à prononcer à voix haute). Le nom vaut pour la
 * géométrie variable : à six, et à quatre avec Katr Tet. « 4+4=7 » en reste
 * l'abréviation graphique. Le Quatuor à une barbe n'existe plus depuis le
 * départ d'Aurore.
 *
 * Les identifiants sont ceux des URL : pas d'accent, ni `+` ni `=`.
 */

import type { VoiceId } from './voices';
import { ZORDER } from './voices';
import { GEOM_KKS, GEOM_KT, type FormationGeom } from './geometry';

export const FORMATION_IDS = ['katrekatr-set', 'katr-tet'] as const;
export type FormationId = (typeof FORMATION_IDS)[number];

export interface Formation extends FormationGeom {
  id: FormationId;
  /** Nom court affiché sur l'onglet */
  tab: string;
  /** Effectif, affiché en second sur l'onglet */
  effectif: string;
  members: VoiceId[];
}

export const FORMATIONS: Record<FormationId, Formation> = {
  // Le nouveau logo de Mathilde, tout le monde sur scène.
  'katrekatr-set': {
    id: 'katrekatr-set',
    tab: 'KatréKatr Set',
    effectif: '6 voix',
    geom: GEOM_KKS,
    members: ZORDER,
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
};

export const FORMATION_LIST: Formation[] = FORMATION_IDS.map((id) => FORMATIONS[id]);

/** La formation par défaut : celle du logo, tout le monde sur scène. */
export const DEFAULT_FORMATION: FormationId = 'katrekatr-set';
