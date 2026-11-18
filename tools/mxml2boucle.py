#!/usr/bin/env python3
"""Traduit un MusicXML en boucle pour le plateau.

    python3 tools/mxml2boucle.py tag.musicxml --voix basse,baryton,lead,tenor

Ecrit sur la sortie standard un fichier prêt à coller dans src/data/pistes/.
Les voix non fournies sortent en silence, avec un avertissement : le plateau en
exige six, cf. le README du dossier pistes.

MuseScore n'est pas lu directement : dans MuseScore, Fichier > Exporter >
MusicXML (compressé .mxl ou non, les deux passent ici). Le format interne .mscz
change d'une version à l'autre, MusicXML non.

Un « temps » vaut ici une noire, comme le bpm des boucles.
"""

import argparse
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from fractions import Fraction

PAS = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
NOMS_DIESE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
NOMS_BEMOL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

# Le moteur (hz() dans plateau.ts) n'accepte que ces alterations.
TOLERE = re.compile(r'^[A-G][b#]?-?\d$')


def lis_xml(chemin):
    """Ouvre un MusicXML, compressé ou non, et rend la racine <score-partwise>."""
    if zipfile.is_zipfile(chemin):
        with zipfile.ZipFile(chemin) as z:
            cible = None
            if 'META-INF/container.xml' in z.namelist():
                cont = ET.fromstring(z.read('META-INF/container.xml'))
                el = cont.find('.//rootfile')
                if el is not None:
                    cible = el.get('full-path')
            if cible is None:
                cands = [n for n in z.namelist()
                         if n.endswith(('.xml', '.musicxml')) and not n.startswith('META-INF')]
                if not cands:
                    raise SystemExit(f"{chemin} : archive sans MusicXML dedans")
                cible = cands[0]
            racine = ET.fromstring(z.read(cible))
    else:
        racine = ET.parse(chemin).getroot()

    if racine.tag == 'score-timewise':
        raise SystemExit('score-timewise non géré : réexporter en score-partwise')
    if racine.tag != 'score-partwise':
        raise SystemExit(f'racine inattendue : <{racine.tag}>')
    return racine


def nom_note(midi, bemols):
    octave = midi // 12 - 1
    table = NOMS_BEMOL if bemols else NOMS_DIESE
    return f'{table[midi % 12]}{octave}'


def hauteur(el):
    """Rend (midi, orthographe) ou (None, None) pour un silence.

    L'orthographe de la partition est conservée : un fa dièse doit ressortir en
    F#, pas en Gb. Le moteur jouerait la même fréquence, mais la ligne se relit
    contre la partition d'origine.
    """
    p = el.find('pitch')
    if p is None:
        return None, None
    lettre = p.findtext('step').strip()
    alt = int(float(p.findtext('alter') or 0))
    octave = int(p.findtext('octave'))
    midi = (octave + 1) * 12 + PAS[lettre] + alt
    ecrit = None
    if alt in (-1, 0, 1):
        ecrit = f"{lettre}{'b' if alt == -1 else '#' if alt == 1 else ''}{octave}"
    return midi, ecrit


def lis_partie(partie, transpose, num_voix):
    """Rend la liste [(midi|None, temps Fraction)] d'une partie.

    Les liaisons de prolongation sont additionnées, les accords réduits à leur
    note la plus haute (une ligne du plateau est monodique).
    """
    div = Fraction(1)
    pas = []
    alerte_accord = False

    for mes in partie.findall('measure'):
        attrs = mes.find('attributes')
        if attrs is not None and attrs.findtext('divisions'):
            div = Fraction(int(attrs.findtext('divisions')))

        for note in mes.findall('note'):
            if note.find('grace') is not None:
                continue                                     # ornement, hors durée
            v = note.findtext('voice')
            if num_voix is not None and v is not None and v.strip() != num_voix:
                continue
            duree = note.findtext('duration')
            if duree is None:
                continue
            temps = Fraction(int(duree)) / div                # 1 = une noire

            m, ecrit = hauteur(note)
            if m is not None:
                m += transpose

            if note.find('chord') is not None:
                # même attaque que la précédente : on garde la plus haute
                if pas and m is not None and pas[-1][0] is not None and m > pas[-1][0]:
                    pas[-1] = (m, pas[-1][1], ecrit)
                alerte_accord = True
                continue

            prolonge = any(t.get('type') == 'stop' for t in note.findall('tie'))
            if prolonge and pas and pas[-1][0] == m:
                pas[-1] = (m, pas[-1][1] + temps, pas[-1][2])
            else:
                pas.append((m, temps, ecrit))

    return pas, alerte_accord


def en_notation(pas, bemols, par_mesure, garde_orthographe):
    """Sérialise en notation compacte, une barre tous les `par_mesure` temps."""
    jetons = []
    cumul = Fraction(0)
    for m, t, ecrit in pas:
        if cumul and par_mesure and cumul % par_mesure == 0:
            jetons.append('|')
        if m is None:
            tete = '_'
        elif garde_orthographe and ecrit:
            tete = ecrit
        else:
            tete = nom_note(m, bemols)
        if not TOLERE.match(tete) and m is not None:
            raise SystemExit(f'note hors grammaire du moteur : {tete}')
        if t == 1:
            jetons.append(tete)
        else:
            f = float(t)
            jetons.append(f'{tete}:{int(f) if f.is_integer() else round(f, 4)}')
        cumul += t
    return ' '.join(jetons)


VOIX = ['basse', 'baryton', 'lead', 'tenor', 'mezzo', 'soprano']


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('fichier')
    ap.add_argument('--voix', required=True,
                    help="quelle voix du site prend quelle partie. Une entrée nue "
                         "consomme les parties dans l'ordre : basse,baryton,lead,tenor. "
                         "Une entrée @P vise la partie P (1 pour la première), et @P:V "
                         "la voix V à l'intérieur : tenor@1:1,lead@1:2,baryton@2:1,"
                         "basse@2:2 pour un TTBB gravé sur deux portées.")
    ap.add_argument('--transpose', type=int, default=0, metavar='N',
                    help='décalage en demi-tons appliqué à toutes les parties')
    ap.add_argument('--id', default='ma-boucle', help='id de la boucle')
    ap.add_argument('--nom', default='À nommer', help='nom affiché')
    ap.add_argument('--bpm', type=int, default=60)
    ap.add_argument('--tie', type=int, default=3, help='nœud papillon, 0 à 3')
    ap.add_argument('--mesure', type=int, default=4, metavar='TEMPS',
                    help='temps par mesure, pour placer les | (0 = aucune)')
    ap.add_argument('--dieses', action='store_true',
                    help='noter les altérations en dièses plutôt qu\'en bémols')
    args = ap.parse_args()

    racine = lis_xml(args.fichier)
    parties = racine.findall('part')
    demandes = [x.strip() for x in args.voix.split(',') if x.strip()]

    lignes = {}
    curseur = 0          # avance seulement sur les entrées nues
    for dem in demandes:
        cible, _, ciblage = dem.partition('@')
        if cible not in VOIX:
            raise SystemExit(f'voix inconnue : {cible} (attendu parmi {", ".join(VOIX)})')
        if cible in lignes:
            raise SystemExit(f'{cible} demandée deux fois')

        if ciblage:
            p, _, num = ciblage.partition(':')
            idx = int(p) - 1
            num = num.strip() or None
        else:
            idx, num = curseur, None
            curseur += 1

        if not 0 <= idx < len(parties):
            raise SystemExit(f'partie {idx + 1} demandée pour {cible}, mais le '
                             f'MusicXML n\'en a que {len(parties)}')

        pas, accord = lis_partie(parties[idx], args.transpose, num)
        if not pas:
            raise SystemExit(f'{cible} : partie {idx + 1}'
                             + (f' voix {num}' if num else '') + ' vide')
        if accord:
            print(f'  ! {cible} : accords réduits à la note la plus haute',
                  file=sys.stderr)
        lignes[cible] = pas

    total = {v: sum(t for _, t, _ in p) for v, p in lignes.items()}
    if len(set(total.values())) > 1:
        print('  ! longueurs inégales : ' +
              ', '.join(f'{v}={float(t)}' for v, t in total.items()), file=sys.stderr)
    duree = max(total.values()) if total else Fraction(16)

    manquantes = [v for v in VOIX if v not in lignes]
    if manquantes:
        print(f'  ! silence posé sur : {", ".join(manquantes)}', file=sys.stderr)
        for v in manquantes:
            lignes[v] = [(None, duree, None)]

    print(f'''/**
 * {args.nom}
 *
 * Traduit de {args.fichier} par tools/mxml2boucle.py.
 * ⚠ Renseigner `origine` avant de publier : d'où vient la pièce et sous quel
 * statut. Cf. le README du dossier et BRIEF §9.
 */

import {{ definirPiste }} from './types';

export default definirPiste({{
  id: '{args.id}',
  nom: '{args.nom}',
  meta: '· {args.bpm} bpm',
  bpm: {args.bpm},
  origine: 'À RENSEIGNER',
  tie: {args.tie},
  lines: {{''')
    for v in VOIX:
        txt = en_notation(lignes[v], not args.dieses, args.mesure or None,
                          args.transpose == 0 and not args.dieses)
        print(f"    {v}: '{txt}',")
    print('  },\n});')


if __name__ == '__main__':
    main()
