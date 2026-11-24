# Charte graphique KatréKatr Set

La référence visuelle du site. Tout vient de Mathilde (affiches, logos,
caricatures) : quand elle tranche quelque chose, on l'écrit ici, puis on
l'applique dans le code. Si le code et ce fichier divergent, c'est ce fichier
qui a raison, et le code est à corriger.

Les choix encore ouverts sont marqués **à confirmer**. Tant qu'ils ne sont
pas tranchés par Mathilde, le site applique la valeur indiquée.

## Le nom

| Forme | Usage |
|---|---|
| **KatréKatr Set** | le nom complet : accent sur le é, K majuscules, espace avant Set |
| **KatréKatr** | forme courte, dans le texte |
| **4+4=7** | en chiffres : uniquement la configuration passée à sept, jamais l'actuelle |
| `katrekatrset`, `katrekatr-set` | adresses, identifiants : sans accent, en minuscules |

Les configurations : **à six** (l'ensemble), **Katr Tet** (quatre voix
graves), **Trois voix hautes** (Maurin, Naïs, Mathilde). Une configuration
sans nom porte le nom chapeau, KatréKatr Set. Les concerts passés gardent
l'étiquette de la configuration qui les a chantés : on ne réétiquette jamais
l'historique.

## Le logo

Variante retenue : celle **en haut à gauche** de la planche de novembre 2026.
On y lit « KaTréKatr », « Ensemble vocal » au-dessus à droite, « Set » à la
verticale, en or. L'affiche du 5 décembre utilise une autre variante (le R à
l'envers) : **à confirmer** laquelle fait référence.

| Déclinaison | Usage | Fichier aujourd'hui | Fichier attendu |
|---|---|---|---|
| Complète, noir et or | disque de l'accueil, image de partage | `src/assets/marks/katrekatr-set.png`, 1785 × 550, détourée d'une capture | vectoriel (SVG ou PDF) |
| Complète, tout noir | impressions monochromes | absente | vectoriel |
| Complète, tout clair | sur fond sombre | absente | vectoriel |
| Courte, sans « Ensemble vocal » | barre du haut, pied de page | absente (on réduit la complète, « Ensemble vocal » devient illisible sous 60 px de haut) | vectoriel |
| Pictogramme carré | icône d'onglet, icône de téléphone | absent (l'onglet affiche encore « 4+4=7 ») | SVG + PNG 512 × 512 |

**Taille minimale** : la version complète ne descend pas sous 60 px de haut à
l'écran. En dessous, on passe à la version courte. **Zone de protection** :
**à confirmer**. Par défaut, la hauteur du K tout autour.

Logo de **Katr Tet** : « Barbershop · KATR TÊT » avec ses filets
(`src/assets/marks/katrtet.png`). Il reste tel quel tant que Mathilde ne le
fait pas évoluer (**à confirmer**).

## Les couleurs

Relevées au pixel sur l'affiche du 16 juillet 2026. Ce sont les variables de
`src/styles/global.css`.

| Variable | Valeur | Rôle |
|---|---|---|
| `--ink` | `#17130E` | encre chaude, presque noire : texte, traits des caricatures |
| `--ink-soft` | `#4A423A` | texte secondaire |
| `--paper` | `#FFFDF7` | le disque blanc, les fonds clairs |
| `--wash` | `#FDF6E6` | fond aquarelle |
| `--gold` | `#F3B72C` | les nœuds papillon, « Set » dans le logo |
| `--gold-deep` | `#DE9412` | accents, millésimes |
| `--peach` | `#E9A18C` | taches d'aquarelle |
| `--lilac` | `#B4A6C4` | taches d'aquarelle |

Les ors sont des accents, jamais des couleurs de texte courant sur fond
clair : ils ne sont pas assez contrastés pour ça (moins de 3:1 sur
`--paper`). `--gold-deep` passe pour du texte en gros (titres, millésimes),
le texte courant reste en `--ink` ou `--ink-soft`.

## La typographie

Quatre familles, chacune avec un seul rôle, comme sur l'affiche. Toutes les
quatre sont des Google Fonts, hébergées par le site lui-même.

| Rôle | Fonte | Usage |
|---|---|---|
| Titres | Archivo Black | titres de section, à la manière de l'affiche peinte |
| Chiffres | Big Shoulders | millésimes de la frise, grands nombres |
| Manuscrit | Caveat | annotations, petites phrases à la main |
| Texte | Karla | corps de texte, étiquettes, données |

Le logo est dessiné et n'utilise aucune de ces fontes : on ne le recompose
jamais en texte.

## Les éléments dessinés

- **Les têtes** (caricatures). Une par chanteur, toutes à la même échelle
  relative que sur le logo, nœud papillon compris pour les hommes. Elles ne
  changent jamais de taille d'une configuration à l'autre. Les actuelles
  (`src/assets/heads/`) font environ 240 px de haut. Attendu : PNG
  transparent d'au moins 1000 px de haut, ou SVG, Aurore comprise pour la
  rangée « Avant ».
- **Les nœuds papillon**, en or, au nombre de quatre (`src/assets/bowties/`).
  Ils marquent le début des sections et servent de puces dans la liste des
  boucles audio.
- **Le disque blanc.** C'est le seul objet fort de la page. Le reste du site
  reste sobre.
- **Le lavis aquarelle**, pêche et lilas sur fond crème, avec une portée dorée
  en bas à droite. Aujourd'hui, il est imité en dégradés CSS. Si Mathilde
  fournit le fond seul (JPEG ou WebP d'au moins 2400 px de large), on prend
  le vrai.

## Les images de partage

Ce sont les images qui s'affichent quand on colle le lien dans WhatsApp,
Facebook ou un mail. Format : 1200 × 630 px exactement, rien d'important à
moins de 60 px des bords. Il y en a deux : celle de l'ensemble (logo complet
+ « Ensemble vocal a cappella · Grenoble ») et celle de Katr Tet. On les
compose à partir du logo et du lavis.

## Les formats de fichier à livrer

Le mieux est du vectoriel : SVG, ou PDF/AI avec les textes vectorisés. À
défaut, du PNG à fond transparent, en grand. Les noms de fichiers sont
libres, on les range au moment de l'intégration.

## Journal des décisions de Mathilde

| Date | Décision |
|---|---|
| 2026-11-19 | Logo : variante en haut à gauche de la planche, choisie par Valentin |
| 2026-11-24 | Nouveau logo déposé sur le Drive du groupe, dossier « visuel pour le site » ; affiche du 5/12 corrigée |
