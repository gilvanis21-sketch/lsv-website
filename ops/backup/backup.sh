#!/bin/sh
# Sauvegarde chiffrée (age, clé PUBLIQUE uniquement sur le serveur) : base PostgreSQL + images téléversées.
set -eu
umask 077
. /etc/backup.env
: "${BACKUP_AGE_RECIPIENT:?BACKUP_AGE_RECIPIENT (clé publique age) est requis}"
DIR=/backups; TS=$(date +%Y%m%d-%H%M%S); mkdir -p "$DIR"
export PGPASSWORD="$POSTGRES_PASSWORD"

pg_dump -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner | age -r "$BACKUP_AGE_RECIPIENT" > "$DIR/db-$TS.dump.age.part"
mv "$DIR/db-$TS.dump.age.part" "$DIR/db-$TS.dump.age"
tar -C /data -cf - uploads | age -r "$BACKUP_AGE_RECIPIENT" > "$DIR/uploads-$TS.tar.age.part"
mv "$DIR/uploads-$TS.tar.age.part" "$DIR/uploads-$TS.tar.age"

# Rétention
find "$DIR" -name '*.age' -mtime +"${BACKUP_RETENTION_DAYS:-30}" -delete

# Copie hors site (OBLIGATOIRE en production : un serveur ne se sauvegarde pas lui-même). Ex. : rclone/rsync.
if [ -n "${BACKUP_OFFSITE_CMD:-}" ]; then sh -c "$BACKUP_OFFSITE_CMD" || { echo "[backup] ÉCHEC copie hors site"; exit 1; }; fi
echo "[backup] OK $TS ($(du -h "$DIR/db-$TS.dump.age" | cut -f1) base, $(du -h "$DIR/uploads-$TS.tar.age" | cut -f1) images)"
