/**
 * Les trois formations programmables, côté plateau.
 *
 * Le texte éditorial vit dans `src/content/formations.yaml` ; ici on ne garde
 * que ce qui pilote le widget : qui est sur scène et où.
 *
 * Les identifiants sont ceux des URL. Ni `+` ni `=` ne passent en URL (ni
 * dans un formulaire SACEM), d'où `4plus4` pour la formation à sept.
 *
 * On ne dit ni « hommes » ni « femmes » : Maurin chante dans le quatuor de
 * voix aiguës, « quatuor féminin » serait faux. Le seul axe vrai dans les
 * trois cas est le registre.
 */

import type { VoiceId } from './voices';
import { ZORDER } from './voices';
import { GEOM_KT, type FormationGeom } from './geometry';

export const FORMATION_IDS = ['4plus4', 'katr-tet', 'quatuor-a-une-barbe'] as const;
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
  // Positions exactes de l'affiche : aucun recentrage.
  '4plus4': {
    id: '4plus4',
    tab: '4+4=7',
    effectif: '7 voix',
    exact: true,
    members: ZORDER,
    mark: { kind: 'img', asset: 'sept', left: 26.214, top: 62.472, w: 46.468 },
  },

  // Le quatuor de voix graves reprend la géométrie de son propre logo.
  'katr-tet': {
    id: 'katr-tet',
    tab: 'Katr Tet',
    effectif: '4 voix',
    geom: GEOM_KT,
    members: ['basse', 'tenor', 'lead', 'baryton'],
    mark: { kind: 'img', asset: 'kt', left: 12.856, top: 46.293, w: 71.758 },
  },

  // Pas de logo existant pour cette formation : centres choisis à la main,
  // ascendants par tessiture, et un logotype purement typographique.
  'quatuor-a-une-barbe': {
    id: 'quatuor-a-une-barbe',
    tab: 'Quatuor à une barbe',
    effectif: '4 voix',
    members: ['tenor', 'alto', 'mezzo', 'soprano'],
    // Mathilde (mezzo) à droite, Naïs (soprano) au milieu : les deux places ont
    // été échangées par rapport au premier jet, qui rangeait les têtes par
    // tessiture croissante.
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

/** La formation par défaut : celle de l'affiche, tout le monde sur scène. */
export const DEFAULT_FORMATION: FormationId = '4plus4';
