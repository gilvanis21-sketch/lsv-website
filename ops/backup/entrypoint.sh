#!/bin/sh
# Les tâches cron n'héritent pas de l'environnement : on le fige dans un fichier lisible par root seul.
# Variables transmises : base (POSTGRES_*), planification (BACKUP_*), restic (RESTIC_*) et identifiants
# du stockage distant (AWS_*, B2_*, AZURE_*, GOOGLE_*, OS_*, ST_*, RCLONE_*).
set -eu
umask 077
: "${RESTIC_REPOSITORY:?RESTIC_REPOSITORY est requis}"
: "${RESTIC_PASSWORD:?RESTIC_PASSWORD est requis}"
printenv | grep -E '^(POSTGRES_|BACKUP_|RESTIC_|AWS_|B2_|AZURE_|GOOGLE_|OS_|ST_|RCLONE_)' | sed "s/'/'\\\\''/g; s/^\([^=]*\)=\(.*\)$/export \1='\2'/" > /etc/backup.env
echo "${BACKUP_CRON:-30 2 * * *} /usr/local/bin/backup.sh >> /proc/1/fd/1 2>&1" > /etc/crontabs/root
echo "[backup] restic -> $RESTIC_REPOSITORY ; planification : ${BACKUP_CRON:-30 2 * * *} (rétention ${BACKUP_RETENTION_DAYS:-30} j + ${BACKUP_KEEP_MONTHLY:-12} mois)"
exec crond -f -l 8
