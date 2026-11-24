#!/usr/bin/env python3
"""
Envoie dist/ sur l'hébergement gratuit OVH (100 Mo, inclus avec le domaine).

    npm run build
    python3 tools/deploy-ovh.py --dry-run     # montre ce qui partirait
    python3 tools/deploy-ovh.py               # envoie

L'hôte et l'identifiant FTP sont dans le mail d'activation d'OVH (ou dans
l'espace client, Hébergements > FTP - SSH). On les passe par l'environnement,
le mot de passe est demandé à chaque fois et n'est écrit nulle part (sauf en
CI, où il vient du secret GitHub OVH_FTP_PASSWORD, cf. deploy.yml) :

    export OVH_FTP_HOST=ftp.clusterXXX.hosting.ovh.net
    export OVH_FTP_USER=katrekb
    export OVH_FTP_DIR=www          # dossier racine du site, `www` par défaut

C'est un miroir : ce qui est sur le serveur et plus dans dist/ est supprimé,
sauf les fichiers propres à OVH (.ovhconfig, dossiers cgi-bin…), qui vivent de
toute façon au-dessus de www/. Les fichiers de _astro/ portent leur empreinte
dans leur nom : s'ils sont déjà là avec la même taille, on ne les renvoie pas.

FTP chiffré (TLS explicite) par défaut. Si OVH le refuse sur l'offre gratuite,
--sans-tls repasse en FTP simple, mot de passe en clair sur le réseau : à
n'utiliser que pour constater que ça marche, puis changer le mot de passe.

Bibliothèque standard uniquement : rien à installer.
"""

from __future__ import annotations

import argparse
import ftplib
import getpass
import os
import sys
from pathlib import Path

GARDER = {'.ovhconfig', '.well-known'}


def lister(ftp: ftplib.FTP, racine: str) -> tuple[dict[str, int], set[str]]:
    """Fichiers (chemin relatif → taille) et dossiers distants, récursivement."""
    fichiers: dict[str, int] = {}
    dossiers: set[str] = set()

    def descendre(rel: str) -> None:
        chemin = f'{racine}/{rel}' if rel else racine
        for nom, faits in ftp.mlsd(chemin, facts=['type', 'size']):
            if nom in ('.', '..') or faits.get('type') in ('cdir', 'pdir'):
                continue
            r = f'{rel}/{nom}' if rel else nom
            if faits.get('type') == 'dir':
                dossiers.add(r)
                descendre(r)
            else:
                fichiers[r] = int(faits.get('size', -1))

    descendre('')
    return fichiers, dossiers


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dry-run', action='store_true', help="n'envoie ni ne supprime rien")
    ap.add_argument('--sans-tls', action='store_true', help='FTP non chiffré (dépannage)')
    ap.add_argument('--dist', default='dist')
    args = ap.parse_args()

    hote = os.environ.get('OVH_FTP_HOST')
    user = os.environ.get('OVH_FTP_USER')
    racine = os.environ.get('OVH_FTP_DIR', 'www').strip('/')
    if not hote or not user:
        print('OVH_FTP_HOST et OVH_FTP_USER doivent être définis (cf. en-tête du script).', file=sys.stderr)
        return 2

    dist = Path(args.dist)
    if not (dist / 'index.html').is_file():
        print(f'{dist}/index.html introuvable : lancer `npm run build` d\'abord.', file=sys.stderr)
        return 2

    locaux = {p.relative_to(dist).as_posix(): p for p in sorted(dist.rglob('*')) if p.is_file()}
    taille = sum(p.stat().st_size for p in locaux.values())
    print(f'{len(locaux)} fichiers, {taille / 1e6:.1f} Mo (quota OVH gratuit : 100 Mo)')

    mdp = os.environ.get('OVH_FTP_PASSWORD') or getpass.getpass(f'Mot de passe FTP de {user}@{hote} : ')
    ftp: ftplib.FTP = ftplib.FTP(timeout=60) if args.sans_tls else ftplib.FTP_TLS(timeout=60)
    ftp.connect(hote, int(os.environ.get('OVH_FTP_PORT', '21')))
    ftp.login(user, mdp)
    if isinstance(ftp, ftplib.FTP_TLS):
        ftp.prot_p()  # chiffre aussi les données, pas seulement la connexion

    distants, dossiers = lister(ftp, racine)

    a_envoyer = [
        r for r in locaux
        if not (r.startswith('_astro/') and distants.get(r) == locaux[r].stat().st_size)
    ]
    a_suppr = [r for r in distants if r not in locaux and r.split('/')[0] not in GARDER]
    dossiers_locaux = {p.relative_to(dist).as_posix() for p in dist.rglob('*') if p.is_dir()}
    dossiers_suppr = sorted(
        (d for d in dossiers if d not in dossiers_locaux and d.split('/')[0] not in GARDER),
        key=lambda d: -d.count('/'),
    )

    print(f'{len(a_envoyer)} à envoyer, {len(locaux) - len(a_envoyer)} inchangés, '
          f'{len(a_suppr)} fichiers et {len(dossiers_suppr)} dossiers à supprimer')

    if args.dry_run:
        for r in a_envoyer:
            print('  +', r)
        for r in a_suppr + dossiers_suppr:
            print('  -', r)
        ftp.quit()
        return 0

    for d in sorted(dossiers_locaux - dossiers, key=lambda d: d.count('/')):
        ftp.mkd(f'{racine}/{d}')
    for r in a_envoyer:
        with open(locaux[r], 'rb') as fh:
            ftp.storbinary(f'STOR {racine}/{r}', fh)
        print('  +', r)
    for r in a_suppr:
        ftp.delete(f'{racine}/{r}')
        print('  -', r)
    for d in dossiers_suppr:
        ftp.rmd(f'{racine}/{d}')
        print('  -', d + '/')

    ftp.quit()
    print('Fait.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
