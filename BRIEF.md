# 4+4=7 — site vitrine

**État : prototype fonctionnel, prêt à être porté sous Astro.js et publié sur GitHub Pages.**

Ce document est le point d'entrée du projet. Il décrit ce qu'est l'ensemble, ce qui a été décidé, ce qui a été construit, ce qui reste ouvert, et comment reprendre le travail.

---

## 1. L'ensemble

Un collectif vocal amateur de Grenoble, sept chanteurs, fondé sur un principe unique : **une voix par partie**. Personne ne double personne.

Trois formations sont programmables :

| Formation | Effectif | Registre | Statut |
|---|---|---|---|
| **Katr Tet** | 4 | quatre voix graves (TTBB) | le quatuor d'origine, ~7 ans |
| **Le Quartet à une barbe** | 4 | quatre voix aiguës (SSAA) | monté vers 2024 |
| **4+4=7** | 7 | voix mixtes (SATB) | les deux réunis |

Quatre plus quatre font sept parce que **Maurin, le ténor, chante dans les deux quatuors** — il tient la ligne d'alto chez les femmes. C'est l'arithmétique du nom, et le ressort de tout le design.

### Les sept

| Prénom | Pupitre | id interne | Formation(s) |
|---|---|---|---|
| Valentin | Basse | `basse` | Katr Tet, 4+4=7 |
| Amédée | Baryton | `baryton` | Katr Tet, 4+4=7 |
| Adrien | Lead | `lead` | Katr Tet, 4+4=7 |
| Maurin | Ténor | `tenor` | **les trois** (pivot) |
| Aurore | Alto | `alto` | Quartet à une barbe, 4+4=7 |
| Naïs | Soprano | `soprano` | Quartet à une barbe, 4+4=7 |
| Mathilde | Mezzo | `mezzo` | Quartet à une barbe, 4+4=7 |

Mathilde Varin est aussi la graphiste : les logos, l'affiche et tous les visuels sont d'elle.

---

## 2. Décisions arrêtées

**Nomenclature des registres.** « Voix égales » a été écarté : en usage choral français, le terme désigne des voix de même nature, ce qui vaut autant pour un TTBB que pour un SSAA — il ne distingue rien. « Quatuor féminin » est factuellement faux puisque Maurin y chante. Le seul axe vrai dans les trois cas est le **registre** : voix graves / voix aiguës / voix mixtes, doublé de la notation TTBB / SSAA / SATB pour les programmateurs musiciens.

**Nom de la formation à 7 : « 4+4=7 »**, retenu contre « KatEtKatSet ». C'est un signe graphique avant d'être un nom, il se lit instantanément, et il raconte le mécanisme. Contrainte : ni `+` ni `=` ne passent en URL ni dans un formulaire SACEM — prévoir une forme écrite de repli (`4plus4`, ou « Quatre plus quatre »).

**Nom de contenant : non tranché.** Voir §7.

**Cible du site.** Ce n'est pas une vitrine de fans, c'est un **outil de programmation**. Le visiteur type est une mairie, un festival, un office de tourisme. Il cherche quatre réponses : qu'est-ce que je peux réserver, à quoi ça ressemble, combien de temps ça dure, qui j'appelle. Tout le reste sert à donner envie sans jamais bloquer l'accès à ces quatre réponses.

---

## 3. Direction artistique

Entièrement dérivée de l'affiche de Mathilde (concert du 16 juillet 2026, Cour du 10 rue Chenoise, Grenoble).

**Palette** — relevée au pixel sur l'affiche.

```
--ink       #17130E   encre chaude, presque noire
--ink-soft  #4A423A   texte secondaire
--paper     #FFFDF7   le rond blanc
--wash      #FDF6E6   fond aquarelle
--gold      #F3B72C   les nœuds papillon
--gold-deep #DE9412   accents, millésimes
--peach     #E9A18C   taches d'aquarelle
--lilac     #B4A6C4   taches d'aquarelle
```

**Typographie** — quatre familles, une fonction chacune, comme sur l'affiche.

| Rôle | Fonte | Usage |
|---|---|---|
| Display | Archivo Black | titres de section, style affiche peinte |
| Chiffres | Big Shoulders Display | logo, millésimes de la frise, grands nombres |
| Script | Caveat | annotations manuscrites, « ça sonne ! » |
| Texte | Karla | corps, étiquettes, données |

**Principes.** Le lavis aquarelle est reconstitué en dégradés radiaux CSS, avec une portée dorée en bas à droite. Le disque blanc est le seul objet fort ; tout le reste du site reste typographiquement discipliné. Les nœuds papillon de Mathilde servent de marqueur en tête de chaque section.

---

## 4. Le widget d'accueil

C'est la pièce maîtresse et la seule audace visuelle du site. Le logo est jouable.

**Ce qu'il fait.** Trois onglets basculent entre les formations. Les têtes se réorganisent en suivant la géométrie exacte du logo correspondant. Cliquer une tête fait entrer sa voix. Un transport (lecture / pause / arrêt) et un choix de boucle occupent le panneau latéral.

**Le disque est un trou.** Un calque circulaire masqué (`overflow:hidden` + `clip-path`) contient les têtes et le logotype. Rien n'existe hors du périmètre : les têtes émergent de sous la ligne au lieu d'apparaître dans le lavis.

**Les vols.** Chaque entrée/sortie part d'un point tiré au hasard sur l'arc nord du disque (−135° à −45°), à 62–82 % du rayon. Le trajet est une Bézier quadratique dont la flèche est tirée entre 16 et 36 % de la corde, signe aléatoire — deux têtes ne suivent jamais la même courbe. Entrée 1,75 s, déplacement 1,4 s, sortie 1,45 s, décalage de 55 ms entre les départs. Chaque tête mémorise son décalage, son échelle et son flou à chaque image : un changement de formation en pleine animation repart exactement de la position visuelle courante.

**Les têtes ne changent jamais de taille.** Contrainte forte. Les largeurs sont identiques au millième entre les trois géométries.

**Fonctions clés dans `index.html`** : `flight()` (moteur de vol), `boxOf()` (géométrie), `layout()` (bascule de formation), `periph()` (point de départ), `swapMark()` (crossfade du logotype), objet `AU` (moteur audio).

### Comment la géométrie a été obtenue

Ce n'est pas du placement à l'œil. Pour chaque logo : détection de l'encre par seuil colorimétrique, isolement des têtes par composantes connexes, puis recalage par **centroïde d'encre** (et non par boîte englobante, faussée par la main d'Adrien et les nœuds papillon décalés). L'échelle est déduite de l'égalisation des aires d'encre : les quatre têtes du logo Katr Tet donnent 0,0218 / 0,0218 / 0,0224 / 0,0220 — un accord à 1,5 % près, qui confirme que Mathilde a dessiné les deux logos aux mêmes proportions. Vérification finale : zéro pixel d'encre hors du disque.

Tout est consigné dans `data/geometry.json`.

### L'audio

**Attention : l'audio est entièrement synthétique.** Aucun enregistrement réel n'existe encore. Trois boucles sont pré-rendues en `OfflineAudioContext` à partir de lignes de notes écrites à la main, avec deux oscillateurs dents-de-scie désaccordés, filtre passe-bas, vibrato et réverbe à réponse impulsionnelle générée.

| Boucle | Origine |
|---|---|
| Evening Rise | traditionnel, compositeur inconnu, généralement considéré du domaine public. Sept lignes de 4 mesures en la mineur sur Am–Dm–C–Am. **Reconstruction plausible, pas l'arrangement du groupe.** |
| Tag barbershop | accords tenus, écrit pour la démo |
| Cadence sacrée | cadence plagale, écrite pour la démo |

Le remplacement par de vraies prises est le point le plus important de la suite. Voir §8.

---

## 5. Structure du site

Ordre actuel, réfléchi pour un programmateur :

1. **Accueil** — le widget, seul.
2. **Formations** — trois cartes au gabarit strictement identique (même format, même longueur de texte, même nombre de puces). L'égalité entre les trois formations ne se décrète pas, elle s'impose par la contrainte typographique.
3. **Écouter** — captations de concert, avec étiquette de formation.
4. **Répertoire** — trois familles (musiques de films / barbershop & standards / classique & sacré), étiquette de formation par titre. Pas de liste exhaustive : elle date, elle ennuie, et elle prive l'organisateur d'une raison d'écrire.
5. **Concerts** — à venir, puis déjà joué, avec lien « Écouter » quand l'enregistrement existe. Placé **avant** l'histoire : ce qu'on peut réserver prime sur d'où l'on vient.
6. **L'histoire** — frise verticale, six jalons de 2018 à 2026, un nœud papillon au jalon de naissance du second quatuor.
7. **Contact** — adresse mail, bloc technique (effectifs, durées, sonorisation, scène, loge, secteur), liens de téléchargement.

---

## 6. Le paquet

```
BRIEF.md              ce document
index.html            prototype autonome, tout est inliné (~590 Ko)
assets/
  heads/              7 têtes, PNG transparents, découpées de l'affiche
    basse.png baryton.png lead.png tenor.png
    alto.png mezzo.png soprano.png
  marks/
    4plus4.png        logotype de l'affiche (4+4=7 + « Ensemble vocal »)
    katrtet.png       logotype Katr Tet (« Barbershop » + KATR TÊT + filets)
  bowties/1..4.png    les quatre nœuds papillon aquarellés
data/
  geometry.json       toutes les coordonnées, commentées
  _geom-*.json        relevés bruts, pour traçabilité
```

Les fichiers `assets/` sont nommés par **identifiant de voix**, pas par position. `mezzo.png` est bien Mathilde (la femme de droite sur l'affiche) et `soprano.png` est Naïs (celle du milieu) — l'appariement a été corrigé et figé dans les données.

---

## 7. Ce qui reste ouvert

**Le nom de contenant.** L'association portera les deux formations et celles à venir (trio, quintette, octuor). « 4+4=7 » et « Katr Tet » sont déjà deux traits d'esprit : le contenant doit être le socle calme qui les porte, pas une troisième blague. Pistes explorées, à soumettre au groupe :

- *famille « têtes »* — Une voix par tête, Une par tête, Têtes d'accord, Voix de tête
- *registre acoustique* — La Voix en plus, Sillage, Battements (autour de l'`expanded sound`, la voix qu'on entend en plus quand l'accord est juste)
- *combinatoire* — Sous-ensembles, Effectif variable

Deux vérifications avant d'acheter : `.fr` libre, et absence d'homonyme au Journal Officiel. Prévoir des domaines de vanité en redirection 301 vers les pages internes plutôt que des sites séparés.

**Affectation des visages féminins.** Aurore est supposée être la femme de gauche sur l'affiche. Non confirmé. Si c'est faux, échanger `IMG` et `GEOM` entre les deux identifiants concernés (même opération que celle déjà faite pour Mathilde/Naïs).

**Dates de la frise.** 2018 / 2020 / 2022 / 2023 / 2024 / 2026 sont des reconstructions à partir du récit oral. À corriger.

**Contenus en attente** : adresse mail réelle, photos, titres de morceaux, dates et lieux des concerts passés, fiche technique PDF.

---

## 8. Suite du travail

**Priorité 1 — enregistrer le tag.** Une session dédiée : click track, même pièce, même micro, même placement pour les sept prises. Sans ça l'empilement sonne collé-serré. Choisir un extrait où chaque voix seule reste écoutable et où toute combinaison partielle tient debout — donc éviter les arrangements où le lead porte 90 % de l'information. Le remplacement dans le code est mécanique : sept fichiers audio au lieu des sept lignes de `PISTES`, le reste du widget ne bouge pas.

**Priorité 2 — le portage Astro.** Points d'attention :

- Le widget est une **île client** (`client:load`). Tout le reste peut être statique.
- Sortir les images de l'inline base64 vers `public/`. Le fichier fait 590 Ko aujourd'hui, dont l'essentiel en images encodées en dur.
- Le contenu (formations, répertoire, concerts, frise) gagne à passer en collections de contenu.
- Trois vraies pages par formation plutôt que des ancres : trois titres, trois images de partage, trois entrées de recherche. Le hero reste commun, simplement pré-réglé.
- `container-type: inline-size` sur le disque et unités `cqw` pour le logotype typographique : à conserver, c'est ce qui garde les proportions.
- `prefers-reduced-motion` court-circuite déjà tout le moteur de vol.

**Priorité 3 — vérifier le mobile.** Le disque devient carré, les têtes petites. C'est le point le plus fragile et il n'a pas été testé sur appareil réel.

---

## 9. Droits et déclarations

Les têtes, les logotypes et les nœuds papillon sont l'œuvre de **Mathilde Varin**. Ils sont ici découpés de fichiers fournis ; l'usage sur le site doit être couvert par un accord avec elle, et idéalement les sources vectorielles récupérées plutôt que ces découpes bitmap.

Le répertoire comprend des musiques de films (Les Aristochats, Toy Story, Gladiator). **Mettre en ligne des captations de ces morceaux relève de la SACEM/SDRM**, indépendamment des concerts, et les arrangements a cappella comptent aussi. C'est une raison de plus d'avancer sur l'association avant de publier la page « Écouter ». *Ceci n'est pas un avis juridique.*

Evening Rise est publié comme traditionnel / compositeur inconnu et généralement traité comme domaine public ; un arrangement particulier peut néanmoins être protégé.
