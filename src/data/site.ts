/**
 * Réglages du site et fiche technique.
 *
 * Les quatre liens de téléchargement pointent dans le vide tant que les
 * documents n'existent pas ; mettre `href: null` les laisse affichés mais
 * inactifs, ce qui est plus honnête qu'un lien mort.
 */

export const SITE = {
  titre: '4+4=7',
  baseline: 'Ensemble vocal · Grenoble',
  /**
   * Adresse « officielle » du groupe. Elle porte le nom du premier quatuor :
   * à revoir quand l'association aura le sien.
   */
  mail: 'katr.tet@gmail.com',
  ville: 'Grenoble',
  /** Crédit graphique, dû sur chaque page */
  graphiste: 'Mathilde Varin',
} as const;

/** Ce que cherche un programmateur : ce qu'il faut prévoir. */
export const FICHE_TECHNIQUE: { k: string; v: string }[] = [
  { k: 'Effectifs', v: '4 voix graves · 4 voix aiguës · 7 voix mixtes' },
  { k: 'Durées', v: "de 20 min à 1 h 30, avec ou sans entracte" },
  { k: 'Sonorisation', v: "aucune jusqu'à 150 places ; 7 micros au-delà" },
  { k: 'Scène', v: '3 × 2 m, sol plat, éclairage simple' },
  { k: 'Loge', v: "un espace clos pour l'échauffement (30 min)" },
  { k: 'Secteur', v: 'Grenoble, Isère et alentours' },
];

/** `href: null` = document pas encore disponible. */
export const TELECHARGEMENTS: { label: string; href: string | null }[] = [
  { label: 'Fiche technique (PDF)', href: null },
  { label: 'Photos haute définition', href: null },
  { label: 'Logos et visuels', href: null },
  { label: 'Liste complète du répertoire', href: null },
];
