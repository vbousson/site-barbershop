/**
 * Géométrie du plateau : coordonnées en % du disque blanc.
 *
 * Relevées au pixel sur les logos originaux de Mathilde Varin, pas placées à
 * l'œil : détection de l'encre par seuil colorimétrique, isolement des têtes
 * par composantes connexes, recalage par centroïde d'encre (et non par boîte
 * englobante, faussée par la main d'Adrien et les nœuds papillon décalés).
 * Le relevé brut d'origine est conservé dans `geometry.releve.json`.
 *
 * Ce module est le seul endroit qui sait où va quoi. Il est lu à la fois au
 * build (positions initiales rendues côté serveur) et à l'exécution (bascule
 * de formation) : une seule source de vérité, aucun risque de dérive.
 */

import type { VoiceId } from './voices';

export interface Box {
  left: number;
  top: number;
  w: number;
  h: number;
}

/** La boîte du logotype : sa hauteur est libre, elle suit le ratio de l'image. */
export interface MarkBox {
  left: number;
  top: number;
  w: number;
}

export type GeomTable = Partial<Record<VoiceId, Box>> & { mark: MarkBox };

/**
 * Affiche du 16 juillet 2026, à sept voix : c'est d'elle que viennent les
 * tailles natives des têtes (`w`, `h`), que toutes les autres tables
 * reprennent au millième. Ses positions servent encore à l'onglet passé
 * 4+4=7, la configuration à sept.
 */
export const GEOM: GeomTable = {
  alto: { left: 12.528, top: 9.934, w: 18.985, h: 28.587 },
  mezzo: { left: 72.241, top: 16.004, w: 18.874, h: 18.985 },
  soprano: { left: 37.804, top: 8.057, w: 23.841, h: 21.854 },
  basse: { left: 8.554, top: 38.3, w: 19.536, h: 27.815 },
  tenor: { left: 28.532, top: 30.243, w: 19.868, h: 28.366 },
  lead: { left: 53.366, top: 29.249, w: 19.757, h: 26.6 },
  baryton: { left: 73.013, top: 37.307, w: 20.751, h: 27.483 },
  mark: { left: 26.214, top: 62.472, w: 46.468 },
};

/**
 * Logo Katr Tet, relevé sur BBshop-4tet-TetesNoir.png.
 * Têtes de gauche à droite : Valentin · Maurin · Adrien · Amédée.
 *
 * Les largeurs sont identiques au millième à celles de GEOM : les têtes ne
 * changent jamais de taille d'une formation à l'autre. Contrainte forte.
 */
export const GEOM_KT: GeomTable = {
  basse: { left: 6.569, top: 23.538, w: 19.536, h: 27.815 },
  tenor: { left: 27.218, top: 16.269, w: 19.868, h: 28.366 },
  lead: { left: 53.069, top: 16.148, w: 19.757, h: 26.6 },
  baryton: { left: 72.68, top: 25.343, w: 20.751, h: 27.483 },
  mark: { left: 12.856, top: 46.293, w: 71.758 },
};

/**
 * Logo KatréKatr Set (novembre 2026), relevé tout entier sur l'affiche du
 * concert du 5 décembre 2026 en haute définition, têtes et logotype : c'est la
 * dernière variante utilisée par Mathilde (R à l'envers, « Ensemble vocal »
 * dessous), retenue le 24/11 à la place de la proposition « en haut à gauche »
 * de la planche. Le fichier du logotype est l'original de Mathilde
 * (KetrekatrSet_Logo.png), recalé sur l'affiche (ECC 0,996).
 *
 * Mathilde a réutilisé exactement les mêmes dessins, réduits d'un même
 * facteur : 0,866, à 1 % près sur les six têtes. Les largeurs ci-dessous sont
 * donc les largeurs natives, et les positions sont celles du logo ramenées à
 * cette échelle (÷ 0,866), recentrées de 3,5 % vers la droite pour que le
 * logotype, plus large que le groupe de têtes, tienne dans le cercle.
 * C'est K (plus bas) qui ramène le tout à la taille de l'affiche.
 *
 * Têtes du haut, de gauche à droite : Maurin · Valentin · Adrien · Amédée.
 * Rangée du bas : Naïs, Mathilde. Script de relevé : tools/releve-logo.py
 * (forme --logo, avec TETES_REF = les découpes d'avant le passage en HD).
 */
export const GEOM_KKS: GeomTable = {
  tenor: { left: 5.627, top: 13.105, w: 19.868, h: 28.366 },
  basse: { left: 26.75, top: 7.158, w: 19.536, h: 27.815 },
  lead: { left: 52.028, top: 7.967, w: 19.757, h: 26.6 },
  baryton: { left: 71.192, top: 13.972, w: 20.751, h: 27.483 },
  soprano: { left: 24.183, top: 35.729, w: 23.841, h: 21.854 },
  mezzo: { left: 51.879, top: 36.436, w: 18.874, h: 18.985 },
  mark: { left: 6.685, top: 59.363, w: 86.828 },
};

/**
 * K = respiration. Tout le contenu du disque est réduit autour de son centre.
 * Une seule valeur à toucher pour resserrer ou aérer la composition.
 *
 * 0,82 = 0,95 × 0,864 : la respiration d'origine (0,95), multipliée par la
 * réduction que Mathilde a appliquée aux têtes sur le logo de novembre 2026.
 * Les têtes s'affichent donc à la taille de la nouvelle affiche, dans les deux
 * formations.
 */
export const K = 0.82;

/** Ramène une coordonnée en % vers le centre du disque. */
export const SC = (v: number): number => 50 + (v - 50) * K;

/** Le logotype : soit une image de Mathilde, soit un bloc typographique. */
export type MarkSpec =
  | { kind: 'img'; asset: 'set' | 'kt' | 'sept'; left: number; top: number; w: number }
  | { kind: 'txt'; lines: string[]; left: number; top: number; w: number; fs: number };

export interface FormationGeom {
  /** Table de positions dédiée (logo Katr Tet). Sinon, on part de l'affiche. */
  geom?: GeomTable;
  /** Positions de l'affiche telles quelles, sans recentrage. */
  exact?: boolean;
  /** Centres imposés (cx, cy en % du disque) quand aucun logo n'existe. */
  centres?: Partial<Record<VoiceId, [number, number]>>;
  mark: MarkSpec;
}

/**
 * La largeur d'une tête reste sa taille native × K, quelle que soit la
 * formation. Seule la position bouge.
 */
export function boxOf(id: VoiceId, f: FormationGeom): Box {
  const table = f.geom ?? GEOM;
  const g = table[id] ?? GEOM[id];
  if (!g) throw new Error(`pas de géométrie pour la voix ${id}`);

  let left: number;
  let top: number;
  if (f.exact || f.geom) {
    left = g.left;
    top = g.top;
  } else {
    const c = f.centres?.[id];
    if (!c) throw new Error(`pas de centre défini pour la voix ${id}`);
    left = c[0] - g.w / 2;
    top = c[1] - g.h / 2;
  }
  return { left: SC(left), top: SC(top), w: g.w * K, h: g.h * K };
}

/** Position et contenu du logotype, déjà mis à l'échelle. */
export function markOf(f: FormationGeom): MarkSpec {
  const m = f.mark;
  return { ...m, left: SC(m.left), top: SC(m.top), w: m.w * K, ...(m.kind === 'txt' ? { fs: m.fs * K } : {}) } as MarkSpec;
}
