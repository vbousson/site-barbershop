#!/usr/bin/env python3
"""Donne à ssh le mot de passe OVH : OVH_SFTP_PASSWORD s'il est défini (en CI,
depuis le secret GitHub), sinon celui rangé dans ~/.netrc pour OVH_SSH_HOST.

Utilisé par tools/deploy-sftp.sh via SSH_ASKPASS : le mot de passe reste dans
~/.netrc (chmod 600) et ne passe ni par la ligne de commande ni par
l'environnement. Ligne attendue dans ~/.netrc :
    machine ftp.clusterXXX.hosting.ovh.net login <user> password <mdp>
"""
import netrc
import os
import sys

if os.environ.get('OVH_SFTP_PASSWORD'):
    print(os.environ['OVH_SFTP_PASSWORD'])
    sys.exit(0)

hote = os.environ.get('OVH_SSH_HOST', '')
try:
    auth = netrc.netrc().authenticators(hote)
except (FileNotFoundError, netrc.NetrcParseError) as e:
    sys.exit(f'~/.netrc illisible : {e}')
if not auth:
    sys.exit(f'Pas d\'entrée « machine {hote} » dans ~/.netrc')
print(auth[2])
