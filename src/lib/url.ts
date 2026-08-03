/**
 * Le site est publié dans un sous-dossier (GitHub Pages), donc tout lien
 * interne doit être préfixé. Passer par cet helper plutôt que d'écrire
 * « /formations/… » à la main évite les liens cassés en production, qui ne
 * se voient pas en développement.
 */

const BASE = import.meta.env.BASE_URL; // '/site-barbershop/' — se termine par /

/** Lien interne, avec la barre oblique finale attendue par `trailingSlash: 'always'`. */
export function href(path = ''): string {
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!clean) return BASE;
  return `${BASE}${clean}/`;
}

/** Ancre sur la page d'accueil, utilisable depuis n'importe quelle page. */
export function anchor(id: string): string {
  return `${BASE}#${id}`;
}
