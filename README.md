# Site web du Laboratoire Scientifique de la Voix (LSV)

Site vitrine + gestion des demandes de rendez-vous. Next.js 16 · PostgreSQL · Docker.

- **Démarrer en développement** : `cp .env.example .env` (remplir) puis `docker compose up -d` → http://localhost:3000 · admin `/admin` · mails de test http://localhost:8025
- **Documentation** : [`docs/`](docs/) — commencer par `14-rapport-final.md`, puis `07` (technique), `08` (utilisateur), `09*` (exploitation), `13` (recette).
- **Production** : `docker-compose.prod.yml` et `docs/09-exploitation.md`. **Rien n'est déployé à ce jour.**
- **Données** : exclusivement fictives en développement. Aucun secret dans le dépôt (`.env*` ignorés).
