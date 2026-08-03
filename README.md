# 4+4=7 — site vitrine

Site statique de l'ensemble vocal grenoblois, porté sous Astro depuis le
prototype d'origine. `BRIEF.md` reste le document de référence du projet :
il décrit l'ensemble, les décisions arrêtées, la direction artistique et ce
qui reste ouvert. Ce fichier-ci ne parle que du code.

En ligne : <https://vbousson.github.io/site-barbershop/>

## Démarrer

```sh
npm install
npm run dev        # http://localhost:4321/site-barbershop/
npm run build      # sortie statique dans dist/
npm run preview    # sert dist/ comme en production
npx astro check    # typage — la CI le lance avant de déployer
```

Node 22 minimum.

## Ce qu'il y a à modifier, et où

Presque tout le contenu est en YAML, éditable sans toucher au code. Une faute
de frappe sur un nom de formation casse le build au lieu de passer inaperçue
en ligne.

| Quoi | Fichier |
|---|---|
| Le texte des trois formations | `src/content/formations.yaml` |
| Les titres du répertoire | `src/content/repertoire.yaml` |
| Les dates de concert | `src/content/concerts.yaml` |
| Les captations | `src/content/enregistrements.yaml` |
| La frise historique | `src/content/frise.yaml` |
| L'adresse mail, la fiche technique, les téléchargements | `src/data/site.ts` |
| Qui chante quelle voix | `src/data/voices.ts` |
| Les photos (légende, texte alternatif, recadrage) | `src/data/photos.ts` |

**Ajouter une photo** : la déposer dans `src/assets/photos/`, l'importer dans
`src/data/photos.ts` avec sa légende et son texte alternatif, puis citer sa clé
dans le YAML. `cadrage` est le recadrage à l'écran (`object-position`),
`cadrageOg` celui de l'image de partage — les deux comptent, les chanteurs sont
dans le bas de ces photos et un recadrage centré leur coupe la tête.

**`brouillon: true`** marque une entrée dont le contenu reste à fournir : elle
s'affiche en gris italique, suivie d'une pastille dorée. Retirer le drapeau
une fois le vrai contenu saisi.

**Les dates** s'écrivent en ISO (`2026-07-16`), ou `null` tant qu'elles ne sont
pas retrouvées. Le partage entre « à venir » et « déjà joué » se recalcule à
chaque déploiement — une date qui passe bascule toute seule.

## À compléter (repris de BRIEF §7)

- [x] L'adresse mail — `katr.tet@gmail.com`, à revoir quand l'association aura la sienne
- [x] Photo de Katr Tet et photo de 4+4=7 (Chenoise, 16 juillet 2026)
- [ ] **Une photo du Quartet à une barbe** — sa carte affiche encore un cadre vide
- [ ] **Les dates et lieux des cinq concerts passés** — cinq lignes `brouillon: true`
      dans `concerts.yaml` attendent leur date
- [ ] Les titres du répertoire — huit lignes `brouillon: true` dans `repertoire.yaml`
- [ ] Les quatre documents à télécharger (fiche technique, photos HD, logos, répertoire)
- [ ] Confirmer les millésimes de la frise, tous marqués `aConfirmer: true`
- [ ] Confirmer l'affectation des visages féminins — voir le commentaire en tête de `src/data/voices.ts`
- [ ] Remplacer l'audio de synthèse par de vraies prises (BRIEF §8, priorité 1)
- [ ] Les captations : rien en ligne, et rien à mettre en ligne avant d'avoir
      réglé la question SACEM (voir plus bas)

## Comment c'est fait

Site entièrement statique. **Une seule île de code client** : le widget du
plateau. Tout le reste est du HTML rendu au build.

```
src/
├── assets/            têtes, logotypes, nœuds papillon (PNG de Mathilde)
├── components/
│   ├── Plateau.astro  le widget : DOM rendu au build, comportement hydraté
│   ├── Hero.astro     le lavis aquarelle + le plateau
│   └── sections/      une par section de la page
├── content/           le contenu éditorial, en YAML
├── data/              voix, géométrie, formations, pistes audio, réglages
├── layouts/Base.astro
├── lib/               accès au contenu, construction des liens
├── pages/
│   ├── index.astro
│   └── formations/[id].astro   une page par formation
├── scripts/plateau.ts le moteur : vols, bascule, audio
└── styles/global.css
```

Quelques points qui méritent qu'on s'y arrête avant de toucher au widget :

**La géométrie est une source unique.** `src/data/geometry.ts` est lu à la fois
au build (pour poser les positions initiales dans le HTML) et à l'exécution
(pour la bascule d'onglet). Les coordonnées sont relevées au pixel sur les
logos de Mathilde, pas placées à l'œil ; le relevé brut est conservé dans
`src/data/geometry.releve.json`.

**Les têtes ne changent jamais de taille.** Les largeurs sont identiques au
millième entre les trois géométries. C'est une contrainte, pas un hasard.

**Le disque est un trou.** `overflow:hidden` + `clip-path` : rien n'existe hors
du périmètre, les têtes émergent de sous la ligne. `container-type:inline-size`
sur le disque et unités `cqw` pour le logotype typographique — c'est ce qui
garde les proportions à toutes les tailles.

**Sans JavaScript, le logo s'affiche quand même**, simplement fixe. Le HTML
contient déjà les têtes à leur place finale ; le script les renvoie aux
coulisses pour rejouer leur arrivée. `prefers-reduced-motion` court-circuite
tout le moteur de vol.

**L'audio est entièrement synthétique.** Trois boucles pré-rendues en
`OfflineAudioContext` à partir de lignes écrites à la main. Le panneau le dit
au visiteur. Le remplacement par de vraies prises est mécanique : sept fichiers
audio à la place des sept lignes de `src/data/pistes.ts`, le reste ne bouge pas.

## Déploiement

Chaque poussée sur `main` déclenche `.github/workflows/deploy.yml` :
`astro check`, puis `astro build`, puis publication sur GitHub Pages.

Une seule chose à faire une fois, côté dépôt :
**Settings → Pages → Source : GitHub Actions**.

Le site est servi dans un sous-dossier au nom du dépôt, d'où le `base` dans
`astro.config.mjs`. Pour passer sur un vrai domaine : mettre `site` au domaine
et supprimer `base`. Tous les liens internes passent par `src/lib/url.ts`, il
n'y a donc rien d'autre à corriger.

## Droits

Les têtes, les logotypes et les nœuds papillon sont l'œuvre de **Mathilde
Varin**. Ils sont ici découpés de fichiers fournis ; l'usage sur le site doit
être couvert par un accord avec elle, et idéalement les sources vectorielles
récupérées plutôt que ces découpes bitmap.

Les trois photos du concert du 16 juillet 2026 sont publiées sans mention
d'auteur : si quelqu'un d'identifié les a prises, le crédit lui est dû dans
`src/data/photos.ts`. La photo du public montre des visages reconnaissables,
dont des enfants — à vérifier avant que le site soit largement diffusé.

Mettre en ligne des captations de musiques de films relève de la SACEM/SDRM,
indépendamment des concerts, et les arrangements a cappella comptent aussi.
Voir BRIEF §9. *Ceci n'est pas un avis juridique.*
