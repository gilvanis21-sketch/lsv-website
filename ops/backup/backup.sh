#!/bin/sh
# Sauvegarde restic (chiffrée, dédupliquée) : base PostgreSQL + images téléversées.
# Le dépôt restic (RESTIC_REPOSITORY) doit être HORS du serveur en production.
set -eu
umask 077
. /etc/backup.env
export RESTIC_CACHE_DIR=/backups/.cache
export PGPASSWORD="$POSTGRES_PASSWORD"
DIR=/backups; mkdir -p "$DIR"

# Initialise le dépôt à la première exécution.
restic cat config >/dev/null 2>&1 || { echo "[backup] initialisation du dépôt restic"; restic init; }

# Base : dump au format custom envoyé directement à restic (aucun fichier clair sur disque).
pg_dump -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner \
  | restic backup --stdin --stdin-filename db.dump --tag db --host lsv
# Images téléversées (restic ne retransmet que ce qui a changé).
restic backup /data/uploads --tag uploads --host lsv

# Rétention puis nettoyage.
restic forget --host lsv --group-by host,tags \
  --keep-within "${BACKUP_RETENTION_DAYS:-30}d" --keep-monthly "${BACKUP_KEEP_MONTHLY:-12}" --prune

# Vérification d'intégrité légère, le 1er de chaque mois.
[ "$(date +%d)" = "01" ] && restic check

touch "$DIR/.last-ok"
echo "[backup] OK $(date +%Y%m%d-%H%M%S)"
