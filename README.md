# KatréKatr Set, site vitrine

Site statique de l'ensemble vocal grenoblois (anciennement 4+4=7), porté sous Astro depuis le
prototype d'origine. `BRIEF.md` reste le document de référence du projet :
il décrit l'ensemble, les décisions arrêtées, la direction artistique et ce
qui reste ouvert. Ce fichier-ci ne parle que du code.

En ligne : <https://katrekatrset.fr> une fois la bascule faite (cf. « Mise en
ligne » plus bas). Jusque-là, l'ancienne version reste sur
<https://vbousson.github.io/site-barbershop/>.

## Démarrer

```sh
npm install
npm run dev        # http://localhost:4321/
npm run build      # sortie statique dans dist/
npm run preview    # sert dist/ comme en production
npx astro check    # typage, lancé par la CI avant de déployer
```

Node 22 minimum.

## Ce qu'il y a à modifier, et où

Presque tout le contenu est en YAML, éditable sans toucher au code. Une faute
de frappe sur un nom de formation casse le build au lieu de passer inaperçue
en ligne.

| Quoi | Fichier |
|---|---|
| Le texte des deux formations | `src/content/formations.yaml` |
| Les titres du répertoire | `src/content/repertoire.yaml` |
| Les dates de concert | `src/content/concerts.yaml` |
| Les captations | `src/content/enregistrements.yaml` |
| La frise historique | `src/content/frise.yaml` |
| L'adresse mail | `src/data/site.ts` |
| Les trois versions à l'essai de la section Contact | `src/components/sections/Contact.astro` |
| Les trois chapôs à l'essai de la section Histoire | `src/components/sections/Histoire.astro` |
| Qui chante quelle voix | `src/data/voices.ts` |
| Les photos (légende, texte alternatif, recadrage) | `src/data/photos.ts` |

**Ajouter une photo** : la déposer dans `src/assets/photos/`, l'importer dans
`src/data/photos.ts` avec sa légende et son texte alternatif, puis citer sa clé
dans le YAML. `cadrage` est le recadrage à l'écran (`object-position`),
`cadrageOg` celui de l'image de partage : les deux comptent, les chanteurs sont
dans le bas de ces photos et un recadrage centré leur coupe la tête.

**`brouillon: true`** marque une entrée dont le contenu reste à fournir : elle
s'affiche en gris italique, suivie d'une pastille dorée. Retirer le drapeau
une fois le vrai contenu saisi.

**Les dates** s'écrivent en ISO (`2026-07-16`), ou `null` tant qu'elles ne sont
pas retrouvées. Le partage entre « à venir » et « déjà joué » se recalcule à
chaque déploiement : une date qui passe bascule toute seule.

## À compléter (repris de BRIEF §7)

- [x] L'adresse mail : `katr.tet@gmail.com`, à revoir quand l'association aura la sienne
- [x] Photo de Katr Tet (Chenoise, 16 juillet 2026)
- [x] Sept concerts datés (2023 → 2026), dont le 5 décembre 2026 à Kateb-Yacine
- [ ] **Une photo de KatréKatr Set à six** : celle de juillet montre le groupe à
      sept, Aurore comprise ; la carte affiche un cadre vide en attendant
- [ ] **Le logotype KatréKatr Set en fichier source** : l'actuel est détouré
      d'une capture WhatsApp (`tools/releve-logo.py`)
- [ ] **Les villes des quatre salles** : Depsival, Salle Olivier Messiaen,
      Atelier du 8, CHU Sud. Un programmateur extérieur ne sait pas où c'est.
- [ ] **Quatre concerts sans date** : deux « Concert entre amis », un mariage,
      une seconde visite au CHU Sud ; voir les commentaires de `concerts.yaml`
- [x] Les titres du répertoire : trois familles renseignées, plus aucun placeholder
- [ ] Arbitrer les deux familles gardées en commentaire dans `repertoire.yaml`
      (« Pop & contemporain », « Autres »)
- [ ] Chihiro et Gladiator, chantés par l'ex-Quatuor à une barbe, sont passés
      en brouillon sous KatréKatr Set : repris à six, ou retirés ?
- [ ] Les quatre documents à télécharger (fiche technique, photos HD, logos, répertoire)
- [ ] Confirmer les millésimes de la frise, tous marqués `aConfirmer: true`
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
└── styles/global.css   le partagé, et rien d'autre
```

**Le CSS est colocalisé.** `global.css` ne garde que ce qui est vraiment
mutualisé : les variables de couleur, la remise à zéro, les fontes, les
primitives typographiques (`h2`, `.eyebrow`, `.lede`), `.wrap`, `.chip`,
`.brouillon`, l'apparition au défilement. Tout le reste vit dans un bloc
`<style>` du composant qui l'utilise, donc portée et chargé seulement sur les
pages concernées.

⚠ **Le piège de la portée.** Astro ajoute un attribut de portée à chaque
compound du sélecteur, ce qui change la spécificité, et ne le pose que sur les
éléments du composant lui-même. Deux conséquences vécues :

- un élément rendu par un **autre composant** (`<Chip>`, `<Bowtie>`) ou **créé
  par le script** (le logotype, les icônes de transport) ne porte pas la portée
  du composant qui le stylise : la partie enfant du sélecteur doit passer en
  `:global()`. Les cas concernés sont commentés sur place.
- une spécificité peut s'inverser : `.top nav a` passait derrière `.top .cta`
  sans portée, et devant avec. D'où `.top nav a.cta`.

Le découpage a été validé par comparaison pixel à pixel avant / après, sur les
5 pages en bureau et en mobile : zéro différence.

Quelques points qui méritent qu'on s'y arrête avant de toucher au widget :

**La géométrie est une source unique.** `src/data/geometry.ts` est lu à la fois
au build (pour poser les positions initiales dans le HTML) et à l'exécution
(pour la bascule d'onglet). Les coordonnées sont relevées au pixel sur les
logos de Mathilde, pas placées à l'œil ; le relevé brut est conservé dans
`src/data/geometry.releve.json`.

**Les têtes ne changent jamais de taille.** Les largeurs sont identiques au
millième entre les géométries. C'est une contrainte, pas un hasard.

**Le disque est un trou.** `overflow:hidden` + `clip-path` : rien n'existe hors
du périmètre, les têtes émergent de sous la ligne. `container-type:inline-size`
sur le disque et unités `cqw` pour le logotype typographique : c'est ce qui
garde les proportions à toutes les tailles.

**Sans JavaScript, le logo s'affiche quand même**, simplement fixe. Le HTML
contient déjà les têtes à leur place finale ; le script les renvoie aux
coulisses pour rejouer leur arrivée. `prefers-reduced-motion` court-circuite
tout le moteur de vol.

**L'audio est entièrement synthétique.** Quatre boucles pré-rendues en
`OfflineAudioContext` à partir de lignes écrites à la main. Le panneau le dit
au visiteur. Le remplacement par de vraies prises est mécanique : six fichiers
audio à la place des six lignes de chaque boucle (`src/data/pistes/`), le reste ne bouge pas.

## Mise en ligne

Deux hébergements sont prêts. On essaie d'abord **OVH**, l'hébergement gratuit
de 100 Mo livré avec le domaine : pas de nouveau compte à ouvrir, le domaine
est déjà rattaché, et le site (moins de 3 Mo) y tient très largement. Si ça
coince, **Firebase Hosting** prend le relais sans rien réécrire.

Dans les deux cas, chaque poussée sur `main` lance
`.github/workflows/deploy.yml` (`astro check` puis `astro build`), et déploie
selon la variable de dépôt `HEBERGEUR` (`ovh` ou `firebase`). Absente, le
site part sur GitHub Pages, https://vbousson.github.io/site-barbershop/,
construit pour ce sous-dossier (`SITE_URL` et `SITE_BASE`, cf.
`astro.config.mjs`) : c'est l'adresse à montrer tant que le domaine ne sert
pas le site.

### Option A : OVH (en service)

Configuration : `public/.htaccess` (HTTPS forcé, redirections, en-têtes de
sécurité, cache long sur `/_astro/`), copié tel quel dans `dist/`. Envoi :
`tools/deploy-sftp.sh`, en SFTP (port 22, chiffré). L'offre gratuite refuse
le FTP chiffré et les clés SSH, et n'ouvre aucun shell : on passe donc par
`sftp` avec le mot de passe, sans miroir (rien n'est supprimé côté serveur).

- **Hôte** `ftp.cluster129.hosting.ovh.net`, **utilisateur** `katrekb`,
  dossier `www/`. La clé du serveur est figée dans `tools/ovh_known_hosts` :
  si OVH la change un jour, le script refuse de se connecter, à refaire avec
  `ssh-keyscan` après vérification dans l'espace client.
- **Mot de passe** : sur le poste, dans `~/.netrc` (chmod 600), ligne
  `machine ftp.cluster129.hosting.ovh.net login katrekb password <mdp>` ;
  en CI, le secret `OVH_SFTP_PASSWORD`. `tools/askpass-netrc.py` le donne à
  ssh sans qu'il passe par la ligne de commande.
- **À la main** :
  ```sh
  npm run build
  tools/deploy-sftp.sh --dry-run   # liste les fichiers et teste la connexion
  tools/deploy-sftp.sh
  ```
- **Automatique** : variable de dépôt `HEBERGEUR` = `ovh` et secret
  `OVH_SFTP_PASSWORD`. Chaque poussée sur `main` construit et envoie.
- Une fois en place : GitHub → Settings → Pages → désactiver l'ancien site.

### Option B : Firebase Hosting

Configuration dans `firebase.json` et `.firebaserc` (projet `katrekatrset`,
compte Google perso, pas celui de Twinsight). Le déploiement par GitHub est
éteint tant que la variable de dépôt `HEBERGEUR` ne vaut pas `firebase`.

1. Créer le projet sur <https://console.firebase.google.com>, identifiant
   `katrekatrset` (plan Spark, gratuit). Si l'identifiant est pris, le
   reporter dans `.firebaserc` et dans le workflow (`projectId` et nom du
   secret).
2. `npx firebase-tools login`, puis `npx firebase-tools init hosting:github` :
   il crée le secret `FIREBASE_SERVICE_ACCOUNT_KATREKATRSET`. Refuser qu'il
   réécrive `firebase.json` et les workflows.
3. GitHub → Settings → Secrets and variables → Actions → Variables :
   `HEBERGEUR` = `firebase`. Pousser `main` : le site sort sur
   `https://katrekatrset.web.app`, et chaque pull request reçoit un canal de
   prévisualisation.
4. Console Firebase → Hosting → domaine personnalisé `katrekatrset.fr` (puis
   `www` en redirection), recopier les enregistrements DNS chez OVH, en
   retirant ceux de l'hébergement gratuit.

Le site est servi à la racine du domaine, d'où l'absence de `base` dans
`astro.config.mjs`. Tous les liens internes passent par `src/lib/url.ts`.

## Droits

Les têtes, les logotypes et les nœuds papillon sont l'œuvre de **Mathilde
Varin**. Ils sont ici découpés de fichiers fournis ; l'usage sur le site doit
être couvert par un accord avec elle, et idéalement les sources vectorielles
récupérées plutôt que ces découpes bitmap.

Les trois photos du concert du 16 juillet 2026 sont publiées sans mention
d'auteur : si quelqu'un d'identifié les a prises, le crédit lui est dû dans
`src/data/photos.ts`. La photo du public montre des visages reconnaissables,
dont des enfants, à vérifier avant que le site soit largement diffusé.

Mettre en ligne des captations de musiques de films relève de la SACEM/SDRM,
indépendamment des concerts, et les arrangements a cappella comptent aussi.
Voir BRIEF §9. *Ceci n'est pas un avis juridique.*
