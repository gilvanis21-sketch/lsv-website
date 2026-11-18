#!/usr/bin/env bash
# Démarre le site LSV (Linux / macOS) : vérifie les dépendances, installe ce qui manque,
# puis lance PostgreSQL, Mailpit, les migrations et le site.
# Usage : ./start.sh [--build] [--stop] [--no-open]   (Windows : start.bat)
set -euo pipefail
cd "$(dirname "$0")"

BUILD=""; OPEN=1; STOP=0
for a in "$@"; do
  case "$a" in
    --build)   BUILD="--build" ;;
    --no-open) OPEN=0 ;;
    --stop)    STOP=1 ;;
    -h|--help) sed -n '2,4p' "$0"; exit 0 ;;
    *) echo "Option inconnue : $a"; exit 1 ;;
  esac
done

ok()   { echo "  ✔ $1"; }
info() { echo "  ▶ $1"; }
die()  { echo "  ✖ $1" >&2; exit 1; }

SUDO=""; [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null && SUDO="sudo"

install_pkgs() {  # $1=pacman $2=apt $3=dnf $4=brew
  if   command -v pacman  >/dev/null; then $SUDO pacman -S --needed --noconfirm $1
  elif command -v apt-get >/dev/null; then $SUDO apt-get update && $SUDO apt-get install -y $2
  elif command -v dnf     >/dev/null; then $SUDO dnf install -y $3
  elif command -v brew    >/dev/null; then brew install $4
  else die "Gestionnaire de paquets non reconnu : installez Docker manuellement (https://docs.docker.com/get-docker/)."; fi
}

echo "Vérification des dépendances"

# 1. Docker (moteur)
if command -v docker >/dev/null; then ok "Docker déjà installé"
else
  info "Docker absent : installation…"
  if [ "$(uname)" = "Darwin" ]; then command -v brew >/dev/null || die "Installez Docker Desktop : https://www.docker.com/products/docker-desktop/"; brew install --cask docker
  else install_pkgs "docker docker-compose" "docker.io docker-compose-v2" "docker docker-compose" "docker"; fi
  command -v docker >/dev/null || die "L'installation de Docker a échoué."
fi

# 2. Docker Compose (plugin v2)
if docker compose version >/dev/null 2>&1; then ok "Docker Compose déjà disponible"
else
  info "Docker Compose absent : installation…"
  install_pkgs "docker-compose" "docker-compose-v2" "docker-compose" "docker-compose"
  docker compose version >/dev/null 2>&1 || die "Docker Compose v2 introuvable après installation."
fi

# 3. Service Docker démarré + droits d'accès
DOCKER="docker"
if ! docker info >/dev/null 2>&1; then
  if [ "$(uname)" = "Darwin" ]; then
    info "Lancement de Docker Desktop…"; open -a Docker
  else
    info "Démarrage du service Docker…"; $SUDO systemctl enable --now docker
  fi
  for _ in $(seq 1 60); do docker info >/dev/null 2>&1 && break; $SUDO docker info >/dev/null 2>&1 && break; sleep 2; done
fi
if docker info >/dev/null 2>&1; then ok "Docker opérationnel"
elif $SUDO docker info >/dev/null 2>&1; then
  DOCKER="$SUDO docker"; ok "Docker opérationnel (via sudo ; astuce : sudo usermod -aG docker \$USER puis reconnexion)"
else die "Docker ne répond pas."; fi

if [ "$STOP" = 1 ]; then $DOCKER compose down; echo "Arrêté (données conservées)."; exit 0; fi

# 4. Fichier de configuration
if [ -f .env ]; then ok "Fichier .env présent"
else
  cp .env.example .env
  die ".env créé depuis .env.example : renseignez-le (mots de passe, secret), puis relancez."
fi

echo; echo "Démarrage du site (le premier lancement télécharge et construit les images, quelques minutes)"
$DOCKER compose up -d --wait $BUILD site mailpit

URL="$(grep -E '^NEXT_PUBLIC_SITE_URL=' .env | cut -d= -f2- || true)"; URL="${URL:-http://localhost:3000}"
ADMIN="$(grep -E '^SEED_ADMIN_EMAIL=' .env | cut -d= -f2- || true)"
cat <<EOF

✔ Prêt
  Site        : $URL
  Admin       : $URL/admin   (identifiant : $ADMIN, mot de passe : SEED_ADMIN_PASSWORD dans .env)
  Mails test  : http://localhost:8025
  Arrêter     : ./start.sh --stop
  Après modif : ./start.sh --build
EOF

if [ "$OPEN" = 1 ]; then
  if command -v xdg-open >/dev/null; then xdg-open "$URL" >/dev/null 2>&1 || true
  elif command -v open >/dev/null; then open "$URL" || true; fi
fi
