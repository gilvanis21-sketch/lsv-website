#!/bin/sh
# Les tâches cron n'héritent pas de l'environnement : on le fige dans un fichier lisible par root seul.
set -eu
umask 077
printenv | grep -E '^(POSTGRES_|BACKUP_)' | sed "s/'/'\\\\''/g; s/^\([^=]*\)=\(.*\)$/export \1='\2'/" > /etc/backup.env
echo "${BACKUP_CRON:-30 2 * * *} /usr/local/bin/backup.sh >> /proc/1/fd/1 2>&1" > /etc/crontabs/root
echo "[backup] planification : ${BACKUP_CRON:-30 2 * * *} (rétention ${BACKUP_RETENTION_DAYS:-30} j)"
exec crond -f -l 8
