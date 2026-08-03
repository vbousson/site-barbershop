// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Le site est publié sur GitHub Pages, dans un sous-dossier au nom du dépôt.
// Un domaine propre plus tard : passer `site` au domaine et vider `base`.
export default defineConfig({
  site: 'https://vbousson.github.io',
  base: '/site-barbershop',
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
      provider: fontProviders.google(),
      name: 'Archivo Black',
      cssVariable: '--font-display',
      weights: [400],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      // Google a renommé « Big Shoulders Display » en « Big Shoulders ».
      // L'ancien nom répond encore sur l'API CSS mais plus dans les métadonnées,
      // donc plus au fournisseur de fontes d'Astro.
      name: 'Big Shoulders',
      cssVariable: '--font-numeral',
      weights: [600, 700, 800],
      fallbacks: ['Archivo Black', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Caveat',
      cssVariable: '--font-script',
      weights: [500, 700],
      fallbacks: ['cursive'],
    },
    {
      provider: fontProviders.google(),
      name: 'Karla',
      cssVariable: '--font-body',
      weights: [400, 500, 700],
      styles: ['normal', 'italic'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
});
