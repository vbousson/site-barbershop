/**
 * Réglages du site et fiche technique.
 *
 * Les quatre liens de téléchargement pointent dans le vide tant que les
 * documents n'existent pas ; mettre `href: null` les laisse affichés mais
 * inactifs, ce qui est plus honnête qu'un lien mort.
 */

export const SITE = {
  titre: 'KatréKatr Set',
  baseline: 'Ensemble vocal · Grenoble',
  /**
   * Adresse « officielle » du groupe. Elle porte le nom du premier quatuor :
   * à revoir quand l'association aura le sien.
   */
  mail: 'katr.tet@gmail.com',
  ville: 'Grenoble',
  /** Le nom court, et l'abréviation graphique qui vient du premier logo. */
  titreCourt: 'KatréKatr',
  abreviation: '4+4=7',
  /** Le domaine, réservé en novembre 2026. */
  domaine: 'katrekatrset.fr',
  /** Crédit graphique, dû sur chaque page */
  graphiste: 'Mathilde Varin',
} as const;

/**
 * ⚠ PLUS AFFICHÉE. La section Contact a été volontairement dépouillée : pas de
 * fiche technique ni de documents à télécharger tant que personne ne les
 * demande. Les données restent ici, prêtes à être remises si le besoin vient.
 */
export const FICHE_TECHNIQUE: { k: string; v: string }[] = [
  { k: 'Effectifs', v: '6 voix mixtes · 4 voix graves (Katr Tet) · 3 voix hautes' },
  { k: 'Durées', v: "de 20 min à 1 h 30, avec ou sans entracte" },
  { k: 'Sonorisation', v: "aucune jusqu'à 150 places ; 6 micros au-delà" },
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
