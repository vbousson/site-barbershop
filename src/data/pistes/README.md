# Écrire une boucle

Une boucle, c'est **sept lignes de même longueur** (une par voix) que le
navigateur transforme en sept fichiers audio et lance au même instant. Le
plateau ne fait rien d'autre : quand tu cliques une tête, il monte le volume de
la ligne correspondante.

Tout se passe dans ce dossier. Le moteur (`src/scripts/plateau.ts`) n'a pas
besoin d'être touché.

## Les trois gestes

**1. Copier un fichier existant.** `tag-barbershop.ts` est le plus simple :
quatre accords tenus.

```
cp src/data/pistes/tag-barbershop.ts src/data/pistes/ma-boucle.ts
```

**2. Écrire les notes.** Chaque ligne est une chaîne de caractères :

```ts
lines: {
  basse:   'C3:2 G2:2 | A2:4',
  baryton: 'E3:2 E3:2 | C3:4',
  // … les cinq autres
}
```

**3. L'inscrire au catalogue**, dans `index.ts` :

```ts
import maBoucle from './ma-boucle';
export const PISTES = [evening, tag, sacre, maBoucle];
```

L'ordre du tableau est l'ordre d'affichage dans le panneau « Boucle », et la
première entrée est celle qui est préchargée. Le serveur de dev recharge tout
seul.

## La notation

| Écrit | Veut dire |
|---|---|
| `C4` | un do, un temps |
| `C4:2` | le même, tenu deux temps |
| `C4:0.5` | une croche |
| `F#3` `Bb4` | dièse et bémol, à l'anglaise |
| `_` | un silence d'un temps (`_:2` pour deux) |
| `\|` | séparateur de mesure, purement décoratif |

Les octaves suivent la convention scientifique : **A4 = 440 Hz**, donc `C4` est
le do du milieu du piano. En repère de tessiture : la basse vit vers `F2`–`D3`,
le lead vers `A3`–`E4`, le soprano vers `E5`–`A5`.

Les barres `|` ne comptent pas dans la durée. Elles sont là pour que la ligne
se relise, alors autant les poser juste : à 4/4, une mesure fait quatre temps.

## Les deux règles

**Les sept lignes doivent faire le même nombre de temps.** C'est la seule
contrainte dure, et elle est vérifiée au build : si tu te trompes, la page
refuse de se construire en te disant quelle voix fait combien de temps. Sans
cette vérification l'erreur serait inaudible au premier tour, puis le morceau
se déliterait au fil des boucles, chaque voix rebouclant sur sa propre durée.

**Les sept voix sont obligatoires.** Une voix qui n'a rien à chanter chante un
silence : `'_:16'`. Pas de ligne absente.

## La règle qui n'était écrite nulle part : deux quatuors superposés

Le plateau ne joue pas sept voix quelconques. Ses cinq onglets font que les
mêmes sept lignes doivent tenir debout dans **cinq configurations** :

| Onglet | Voix allumables |
|---|---|
| KatréKatr Set | les six d'aujourd'hui (tout sauf l'alto) |
| Katr Tet | basse, baryton, lead, ténor |
| KatréKatr, 3 voix hautes | ténor, mezzo, soprano |
| 4+4=7 (avant) | les sept |
| Quatuor à une barbe (avant) | ténor, alto, mezzo, soprano |

L'alto est la ligne d'Aurore : elle ne chante plus que dans les deux onglets
« Avant ». Depuis le passage à six, le trio voix hautes demande que ténor,
mezzo et soprano disent l'accord à eux trois, sans l'alto.

Le ténor est dans les deux quatuors, comme Maurin. Donc **chaque accord doit
être voicé deux fois** : une fois par le quatuor grave, une fois par le quatuor
aigu, la ligne de ténor servant de sommet au premier et de fondement au second.

Les trois boucles d'origine respectent cette règle sans le dire. Le tag, par
exemple, sur son premier accord :

```
quatuor grave   basse Bb2 · baryton G3 · lead D4 · ténor F4    → Bb6 complet
quatuor aigu             ténor F4 · alto G4 · mezzo Bb4 · soprano D5   → Bb6 complet
```

En pratique : écris d'abord le quatuor grave comme un TTBB normal, ténor au
sommet. Puis rejoue le même accord au-dessus du ténor avec alto, mezzo et
soprano. Rien n'interdit un croisement de voix (le tag en a), mais un accord
incomplet dans l'un des deux quatuors s'entend tout de suite : il suffit de
cliquer un onglet pour le vérifier.

C'est aussi ce qui distingue ce travail d'une simple transcription. Un tag
barbershop publié est un TTBB, donc quatre lignes sur sept : le quatuor aigu
reste à écrire, et une transposition mécanique du TTBB ne suffit pas puisque la
ligne de ténor doit rester commune aux deux.

## Choisir un extrait

Le plateau permet d'allumer n'importe quel sous-ensemble des voix, une par une.
Une boucle réussie est donc une boucle où **chaque voix seule reste écoutable**
et où **toute combinaison partielle tient debout**. Les arrangements où le lead
porte 90 % de l'information sonnent creux dès qu'on l'éteint : à éviter ici,
même s'ils marchent en concert.

## Partir d'un fichier MuseScore

Si la ligne existe déjà gravée, il n'y a pas à la retaper. Dans MuseScore,
Fichier > Exporter > MusicXML, puis :

```
python3 tools/mxml2boucle.py mon-tag.musicxml \
  --voix "tenor@1:1,lead@1:2,baryton@2:1,basse@2:2" \
  --id mon-tag --nom "Mon tag" --bpm 58 > src/data/pistes/mon-tag.ts
```

`--voix` dit quelle voix du site prend quelle partie. Une entrée nue consomme
les parties dans l'ordre (`basse,baryton,lead,tenor`) ; la forme `@partie:voix`
sert quand un TTBB est gravé sur deux portées à deux voix chacune, ce qui est
le cas le plus fréquent. `--transpose N` décale de N demi-tons.

Ce que l'outil fait pour toi : additionne les liaisons de prolongation, réduit
un éventuel accord à sa note la plus haute (une ligne est monodique), conserve
l'orthographe de la partition (un fa dièse ressort en `F#`, pas en `Gb`), pose
les barres de mesure, et met un silence sur les voix que le fichier ne fournit
pas, en te disant lesquelles.

Ce qu'il ne fait pas : écrire le quatuor aigu à ta place, ni renseigner
`origine`. Il laisse `'À RENSEIGNER'` exprès.

## Le nœud papillon

Le champ `tie` (0 à 3) choisit lequel des quatre nœuds papillon aquarellés de
Mathilde marque la boucle dans la liste. Prends-en un que les voisines
n'utilisent pas : c'est ce qui distingue les entrées d'un coup d'œil.

## Le champ `origine`

Il porte la mention de droits : d'où vient la pièce, et sous quel statut. Ce
n'est pas de la décoration. Le répertoire du groupe comprend des musiques de
films, et mettre en ligne une captation relève de la SACEM/SDRM indépendamment
des concerts (cf. BRIEF §9). Une boucle écrite pour la démo le dit ; une pièce
reprise dit d'où elle vient.

## Quand il y aura de vraies prises

Cette couche disparaît. Les sept lignes de synthèse deviennent sept fichiers
audio et `renderVoice()` cède la place à un `decodeAudioData()`. Le reste du
plateau (les vols, la bascule de formation, l'arc doré, le transport) ne
bouge pas d'une ligne. C'est la priorité 1 du BRIEF.
