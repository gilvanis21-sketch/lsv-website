#!/bin/sh
# Restauration de la BASE DE DONNÉES depuis le dépôt restic.
#   ops/restore.sh [snapshot|latest] [base-cible]
# `ops/dc exec backup restic snapshots --tag db` liste les sauvegardes disponibles.
# Par défaut : dernière sauvegarde, vers une base de TEST « lsv_restore_test » (production intacte).
# Production : passer le nom de la base de production en 2e argument (voir docs/09c).
# Le mot de passe du dépôt et l'accès au stockage sont lus dans .env.production (par le conteneur backup).
set -eu
SNAP=${1:-latest}; TARGET=${2:-lsv_restore_test}
cd "$(dirname "$0")/.."
# Lecture sans « source » : le fichier .env.production n'est pas un script shell.
getenv() { grep -E "^$1=" .env.production | head -1 | cut -d= -f2-; }
PGUSER=$(getenv POSTGRES_USER); PGDB=$(getenv POSTGRES_DB)
case "$SNAP" in *[!a-f0-9latest]*) echo "Identifiant de snapshot invalide."; exit 1;; esac
if [ "$TARGET" = "$PGDB" ]; then
  echo "⚠ RESTAURATION SUR LA BASE DE PRODUCTION '$TARGET'. Arrêtez d'abord le site : ./ops/dc stop app"
  printf "Tapez OUI pour continuer : "; read -r ok; [ "$ok" = "OUI" ] || { echo "Annulé."; exit 1; }
fi
./ops/dc exec -T db psql -U "$PGUSER" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$TARGET\"" -c "CREATE DATABASE \"$TARGET\"" >/dev/null
# --entrypoint sh : l'image de sauvegarde lance crond par défaut.
./ops/dc run --rm --no-deps -T --entrypoint sh backup -c \
  "export RESTIC_CACHE_DIR=/tmp/restic; restic dump --tag db $SNAP /db.dump | PGPASSWORD=\$POSTGRES_PASSWORD pg_restore -h db -U \$POSTGRES_USER -d $TARGET --no-owner --exit-on-error"
echo "Restauration terminée vers la base '$TARGET'."
