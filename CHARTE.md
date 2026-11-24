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

Variante retenue le 24/11 : **celle de l'affiche du 5 décembre**, la
dernière utilisée par Mathilde. R à l'envers, « Ensemble vocal » en dessous,
« Set » vertical en or. Fichier : `KetrekatrSet_Logo.png` (Drive, 1478 × 514,
fond transparent), copié tel quel dans `src/assets/marks/katrekatr-set.png`.
La proposition « en haut à gauche » de la planche, utilisée jusque-là, est
abandonnée.

Le logo n'est pas figé : Mathilde envisage de retoucher le **K**, qui a « un
petit côté H » (on lit « HS » au lieu de « KS »). Attendre sa version avant
de refaire les déclinaisons.

**Polices du logo** (Mathilde, 24/11) : **Boomtown Deco** pour les lettres
capitales, **Riesling** pour la police fine (« Ensemble vocal », « Set »).

| Déclinaison | Usage | Fichier aujourd'hui | Fichier attendu |
|---|---|---|---|
| Complète, noir et or | disque de l'accueil, image de partage | `src/assets/marks/katrekatr-set.png`, l'original de Mathilde, 1478 × 514 | vectoriel (SVG ou PDF), après la retouche du K |
| Complète, tout noir | impressions monochromes | absente | vectoriel |
| Complète, tout clair | sur fond sombre | absente | vectoriel |
| Courte, sans « Ensemble vocal » | barre du haut, pied de page | absente (on réduit la complète, « Ensemble vocal » devient illisible sous 60 px de haut) | vectoriel |
| Pictogramme | icône d'onglet, icône de téléphone | d'après le dessin de Mathilde (24/11) : K en Boomtown Deco gris ardoise `#353C41`, « Set » vertical en Riesling or `#E5A43B`, cercle doré sur crème `#F4F0E6`. `public/favicon.svg` (version onglet : cercle épais, lettres agrandies, lisible à 16 px), `src/assets/pictogramme.svg` (version fine, fidèle au dessin), `public/apple-touch-icon.png` 180 px, `public/icon-512.png` | à refaire si Mathilde retouche le K |

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

**Ce que Mathilde utilise** (24/11) : Boomtown Deco et Riesling pour le logo,
**Futura** pour le texte des affiches. Sa proposition pour le site : Boomtown
pour les titres, Riesling pour les sous-titres et les titres de morceaux,
Futura ou une police simple pour le reste. Riesling n'est pas assez lisible en
texte courant. Pour l'ergonomie, elle renvoie à Naïs. Boomtown Deco et
Riesling sont gratuites d'après elle ; Futura est payante (équivalent libre :
Jost). **À vérifier** : que leurs licences autorisent l'intégration web.

**Ce que le site utilise** (24/11) : **Boomtown Deco** pour tous les titres,
**Jost** (équivalent libre de Futura) pour le texte courant. Riesling,
essayée sur les titres de morceaux, est illisible hors du logo : écartée.
Mathilde ne l'emploie d'ailleurs que dans ses logos (l'affiche de juillet
n'utilise que Boomtown Deco, Futura et Marker Felt).

Boomtown Deco (Chris Skillern) est gratuite pour un usage personnel, la
licence commerciale est à demander à son auteur ; Valentin teste d'abord
ainsi et paiera s'il le faut. Elle n'a **aucun accent** : le site utilise
`src/assets/fonts/boomtown-deco-fr.ttf`, complétée par
`tools/boomtown-accents.py` (é è ê ë à â î ï ô ù û ü ç et capitales,
accents dessinés à l'épaisseur de ses fûts). Elle est très étroite : il lui
faut environ 1,5 fois le corps d'une police normale. Une adresse mail ou un
numéro se composent en Jost, jamais en Boomtown.

| Rôle | Fonte | Usage |
|---|---|---|
| Titres | Boomtown Deco FR | titres de section, de frise, de pistes |
| Chiffres | Big Shoulders | millésimes de la frise, grands nombres |
| Manuscrit | Caveat | annotations, petites phrases à la main |
| Texte | Jost (équivalent libre de Futura) | corps de texte, étiquettes, données |

Le logo est dessiné et n'utilise aucune de ces fontes : on ne le recompose
jamais en texte.

## Les éléments dessinés

- **Les têtes** (caricatures). Une par chanteur, nœud papillon compris pour
  les hommes. Elles ne changent jamais de taille d'une configuration à
  l'autre. Sources : `Trombinoscope/` du Drive, fond blanc, ~1300 px. Toutes
  les affiches les réutilisent au même facteur (0,239 sur l'affiche de
  juillet). Depuis le 24/11, `src/assets/heads/` en est tiré par
  `tools/hd-tetes.py` (fond rendu transparent, même cadrage que les anciennes
  découpes, ~1000 px de haut). Une tête sans nom dans le trombinoscope,
  `Fichier (2025-11-14…)` : Jo, sans emploi sur le site.
- **Les nœuds papillon**, en or, au nombre de quatre (`src/assets/bowties/`).
  Ils marquent le début des sections, les jalons de la frise et servent de
  puces dans la liste des boucles audio. La question de leur nombre et de leur
  côté masculin dans un ensemble mixte a été posée le 24/11 ; Valentin a
  choisi de les garder.
- **Le disque blanc.** C'est le seul objet fort de la page. Le reste du site
  reste sobre.
- **L'aquarelle de fond**, la vraie, sans texte (`fondaffiche.jpeg`,
  6948 × 4852, paysage) : fond de la bannière d'accueil depuis le 24/11
  (`src/assets/fond/aquarelle.jpg`, réduite à 3200 px), **en filigrane**
  (opacité 0,32, saturation 0,6) : elle doit rester discrète. Les rayons dorés
  partent d'en bas à droite, c'est le coin à garder quand l'écran rogne.
  Mathilde a aussi fait une version bandeau (`KKS_bandeau.jpeg`,
  1880 × 725) ; elle peut recouper à d'autres dimensions sur demande.

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

## Le Drive « Visuels » : ce qui sert, ce qui est obsolète

Le dossier contient des variantes anciennes : ne pas les prendre pour
référence sans demander.

| Fichier | Statut |
|---|---|
| `Trombinoscope/*.jpg` | **à jour** : les têtes, source du site |
| `fondaffiche.jpeg`, `KKS_bandeau.jpeg` | **à jour** : l'aquarelle seule, et en bandeau |
| `KetrekatrSet_Logo.png` | **à jour**, variante retenue ; le K va peut-être changer |
| `KatrekatreSet-affBibKY.jpg` | affiche du 5/12, 3508 × 4961 |
| `BBshop4Tet logos Mathilde/BBshop-4tet-*.png`, `fond blanc/noir.jpg` | logo Katr Tet, en vigueur |
| `4+4=7-logocomplet.png`, `4+4=7-chenoise v2*` | configuration passée à sept (juillet 2026) : historique |
| `4+4=7-logo_OLD.png`, `4+4=6.png` | **obsolètes** |
| `BBshop4Tet logos Mathilde/IA/` | **obsolète** : essais de 2023 |

## Journal des décisions de Mathilde

| Date | Décision |
|---|---|
| 2026-11-19 | Logo : variante en haut à gauche de la planche, choisie par Valentin |
| 2026-11-24 | Nouveau logo déposé sur le Drive du groupe, dossier « Visuels » ; affiche du 5/12 corrigée |
| 2026-11-24 | Polices : Boomtown Deco + Riesling (logo), Futura (texte des affiches) ; Boomtown pour les titres, Riesling pour les sous-titres, une police simple pour le corps |
| 2026-11-24 | Aquarelle de fond seule et version bandeau déposées ; découpe sur mesure possible |
| 2026-11-24 | Favicon : monogramme K + S en préparation ; le nœud papillon, écarté pour le favicon, reste comme marqueur sur le site |
| 2026-11-24 | Le K du logo sera peut-être retouché (on lit « HS ») |
| 2026-11-24 | Pictogramme K + « Set » vertical dans un cercle doré (dessin de Mathilde), reconstruit en vectoriel pour le favicon |
| 2026-11-24 | Valentin : variante du logo de l'affiche du 5/12 ; aquarelle en filigrane ; nœuds papillon gardés ; Boomtown Deco pour les titres, Jost pour le texte, Riesling écartée (illisible hors du logo) |
