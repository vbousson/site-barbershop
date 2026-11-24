// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Le site est servi à la racine de son domaine (OVH, ou Firebase en secours).
// En attendant, il reste aussi publié sur GitHub Pages, dans un sous-dossier :
// la CI passe SITE_URL et SITE_BASE pour cette construction-là. Tous les liens
// internes passent par src/lib/url.ts, il n'y a rien d'autre à corriger.
export default defineConfig({
  site: process.env.SITE_URL || 'https://katrekatrset.fr',
  base: process.env.SITE_BASE || '/',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },

  // Un programmateur nous trouve d'abord par un moteur de recherche : c'est
  // toute la raison d'avoir trois vraies pages plutôt que trois ancres.
  integrations: [sitemap()],

  // Fontes self-hébergées : sous-groupées, préchargées, servies depuis _astro/fonts.
  // Quatre familles, une fonction chacune, comme sur l'affiche de Mathilde.
  fonts: [
    {
      // La police du logo et des affiches de Mathilde, pour les titres.
      // Boomtown Deco (Chris Skillern) n'a aucun accent : la version FR est
      // complétée par tools/boomtown-accents.py. Licence : gratuite pour un
      // usage personnel, commerciale à demander à l'auteur (cf. CHARTE.md).
      provider: fontProviders.local(),
      name: 'Boomtown Deco FR',
      cssVariable: '--font-display',
      fallbacks: ['Big Shoulders', 'Arial Narrow', 'sans-serif'],
      options: {
        variants: [{ src: ['./src/assets/fonts/boomtown-deco-fr.ttf'], weight: 400, style: 'normal' }],
      },
    },
    {
      provider: fontProviders.google(),
      // Google a renommé « Big Shoulders Display » en « Big Shoulders ».
      // L'ancien nom répond encore sur l'API CSS mais plus dans les métadonnées,
      // donc plus au fournisseur de fontes d'Astro.
      name: 'Big Shoulders',
      cssVariable: '--font-numeral',
      weights: [600, 700, 800],
      fallbacks: ['Arial Narrow', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Caveat',
      cssVariable: '--font-script',
      weights: [500, 700],
      fallbacks: ['cursive'],
    },
    {
      // Mathilde écrit le texte de ses affiches en Futura (payante) : Jost en
      // est l'équivalent libre.
      provider: fontProviders.google(),
      name: 'Jost',
      cssVariable: '--font-body',
      weights: [400, 500, 700],
      styles: ['normal', 'italic'],
      fallbacks: ['Futura', 'system-ui', 'sans-serif'],
    },
  ],
});
