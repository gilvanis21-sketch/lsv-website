#!/bin/sh
# Restauration d'une sauvegarde chiffrée de la BASE DE DONNÉES.
#   ops/restore.sh <db-AAAAMMJJ-HHMMSS.dump.age> <clé-privée-age.txt> [base-cible]
# Par défaut : restaure vers une base de TEST « lsv_restore_test » (la production n'est pas touchée).
# Production : passer le nom de la base de production en 3e argument (voir docs/09c).
set -eu
FILE=${1:?fichier db-*.dump.age (nom dans /backups)}; KEY=${2:?chemin ABSOLU de la clé privée age}; TARGET=${3:-lsv_restore_test}
cd "$(dirname "$0")/.."
# Lecture sans « source » : le fichier .env.production n'est pas un script shell.
getenv() { grep -E "^$1=" .env.production | head -1 | cut -d= -f2-; }
PGUSER=$(getenv POSTGRES_USER); PGDB=$(getenv POSTGRES_DB)
if [ "$TARGET" = "$PGDB" ]; then
  echo "⚠ RESTAURATION SUR LA BASE DE PRODUCTION '$TARGET'. Arrêtez d'abord le site : ./ops/dc stop app"
  printf "Tapez OUI pour continuer : "; read -r ok; [ "$ok" = "OUI" ] || { echo "Annulé."; exit 1; }
fi
./ops/dc exec -T db psql -U "$PGUSER" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$TARGET\"" -c "CREATE DATABASE \"$TARGET\"" >/dev/null
# --entrypoint sh : l'image de sauvegarde lance crond par défaut.
./ops/dc run --rm --no-deps -T --entrypoint sh -v "$KEY:/key.txt:ro" backup -c \
  "age -d -i /key.txt /backups/$FILE | PGPASSWORD=\$POSTGRES_PASSWORD pg_restore -h db -U \$POSTGRES_USER -d $TARGET --no-owner --exit-on-error"
echo "Restauration terminée vers la base '$TARGET'."
