#!/usr/bin/env bash
# Envoie dist/ sur l'hébergement gratuit OVH par SSH (port 22, chiffré).
#
#   npm run build
#   tools/deploy-sftp.sh --dry-run    # liste ce qui partirait
#   tools/deploy-sftp.sh              # envoie
#
# L'offre gratuite n'accepte pas les clés SSH : le mot de passe est lu dans
# ~/.netrc par tools/askpass-netrc.py (ligne « machine <hôte> login <user>
# password <mdp> », chmod 600). Envoi sftp de dist/ dans www/, sans
# suppression (pas de shell sur l'offre gratuite, donc pas de rsync).
set -euo pipefail

HOTE=${OVH_SSH_HOST:-ftp.cluster129.hosting.ovh.net}
USER_=${OVH_SSH_USER:-katrekb}
DIR=${OVH_DIR:-www}
ICI=$(cd "$(dirname "$0")/.." && pwd)
DIST="$ICI/dist"

[[ -f "$DIST/index.html" ]] || { echo "dist/index.html introuvable : lancer « npm run build » d'abord." >&2; exit 2; }
if grep -q 'href="/site-barbershop/' "$DIST/index.html"; then
  echo "dist/ a été construit pour GitHub Pages (/site-barbershop/) : relancer « npm run build »." >&2; exit 2
fi

export OVH_SSH_HOST=$HOTE SSH_ASKPASS="$ICI/tools/askpass-netrc.py" SSH_ASKPASS_REQUIRE=force
# Un seul essai de mot de passe, et pas d'attente infinie : l'offre gratuite
# n'ouvre que le SFTP (aucune commande à distance), et OVH bannit l'adresse
# après plusieurs échecs. BatchMode=no : sftp -b coupe sinon toute demande de
# mot de passe, askpass compris.
# La clé du serveur est figée dans tools/ovh_known_hosts : on n'envoie le mot
# de passe qu'à ce serveur-là (vrai aussi en CI, où rien n'est connu d'avance).
OPTS=(-o BatchMode=no -o ConnectTimeout=15
      -o UserKnownHostsFile="$ICI/tools/ovh_known_hosts" -o StrictHostKeyChecking=yes -o PubkeyAuthentication=no
      -o PreferredAuthentications=password -o NumberOfPasswordPrompts=1)

if [[ ${1:-} == --dry-run ]]; then
  echo "Partirait vers $USER_@$HOTE:$DIR/ :"
  (cd "$DIST" && find . -type f | sort)
  echo "Test de connexion :"
  printf 'ls %s\n' "$DIR" | sftp "${OPTS[@]}" -b - "$USER_@$HOTE"
  exit 0
fi

# Pas de miroir possible sans shell : on écrase, sans supprimer ce qui a
# disparu de dist/ (les fichiers de _astro/ portent leur empreinte, les
# anciens restent mais ne gênent pas ; faire le ménage à la main de temps en temps).
# index.html est d'abord un lien symbolique d'OVH (la page « Site en
# construction ») qu'on ne peut pas écraser : on l'enlève (le « - » ignore
# l'erreur quand il n'existe plus).
sftp "${OPTS[@]}" -b - "$USER_@$HOTE" <<SFTP
lcd $DIST
cd $DIR
-rm index.html
put -r *
put .htaccess
SFTP
echo "Fait : https://katrekatrset.fr/"
