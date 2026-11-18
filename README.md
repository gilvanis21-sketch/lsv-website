# Site web du Laboratoire Scientifique de la Voix (LSV)

Site vitrine + gestion des demandes de rendez-vous. Next.js 16 · PostgreSQL · Docker.

- **Démarrer en développement (tout-en-un)** : le script vérifie et installe les dépendances manquantes (Docker), puis lance le site et ouvre le navigateur.
  - **Windows** : double-cliquer sur `start.bat` (options : `start.bat -Build`, `-Stop`, `-NoOpen`). Au premier lancement, Docker Desktop peut demander un redémarrage de Windows (WSL2) et l'acceptation de ses conditions : relancer ensuite `start.bat`.
  - **Linux / macOS** : `./start.sh` (options : `--build`, `--stop`, `--no-open`).
  - Au premier lancement, `.env` est créé depuis `.env.example` : le remplir, puis relancer.
  - Accès : http://localhost:3000 · admin `/admin` · mails de test http://localhost:8025
- **Démarrer manuellement** : `cp .env.example .env` (remplir) puis `docker compose up -d`
- **Documentation** : [`docs/`](docs/) — commencer par `14-rapport-final.md`, puis `07` (technique), `08` (utilisateur), `09*` (exploitation), `13` (recette).
- **Sauvegardes** : [restic](https://restic.net) (chiffrées, dédupliquées) vers un dépôt hors site ; configuration `RESTIC_REPOSITORY` / `RESTIC_PASSWORD` dans `.env.production`. Restauration : `./ops/restore.sh latest`. Voir `docs/09c-sauvegarde-restauration.md`.
- **Production** : `docker-compose.prod.yml` et `docs/09-exploitation.md`. **Rien n'est déployé à ce jour.**
- **Données** : exclusivement fictives en développement. Aucun secret dans le dépôt (`.env*` ignorés).
