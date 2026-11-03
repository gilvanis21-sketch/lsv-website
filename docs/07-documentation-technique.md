# 07 — Documentation technique

## 1. Vue d'ensemble
Application **Next.js 16 (App Router) + TypeScript**, base **PostgreSQL 16** via **Drizzle ORM**, **Tailwind CSS 4**, conteneurisée (Docker). Décision d'architecture : `03-comparatif-architectures-et-decision.md` (option B validée par le client le 2026-11-03).

```
lsv-website/
├─ docker-compose.yml            # LOCAL : db + mailpit + site (rapide) ; profil « dev » = rechargement auto
├─ docker-compose.prod.yml       # PRODUCTION (caddy, app, db, backup, uptime)
├─ ops/                          # Caddyfile, backup/, restore.sh, dc (raccourci)
├─ tests/                        # security_suite.py, perf_check.py, browser/ (Playwright + axe)
├─ docs/                         # toute la documentation et les rapports
└─ web/
   ├─ src/app/(site)/            # pages publiques
   ├─ src/app/admin/             # login + (panel)/… + actions.ts (toutes les actions serveur)
   ├─ src/app/api/               # demandes (POST public), health
   ├─ src/app/media/[name]/      # diffusion des images téléversées
   ├─ src/proxy.ts               # CSP à nonce, HSTS
   ├─ src/lib/                   # auth, totp, validation, ratelimit, mail, uploads, queries, audit…
   ├─ src/db/schema.ts           # schéma de la base ; migrations dans web/drizzle/
   └─ scripts/                   # migrate, seed, seed-demo (dev), purge
```

## 2. Environnement de développement
```
docker compose up -d                   # version RAPIDE (build de production) : http://localhost:3000, admin /admin, mails http://localhost:8025
docker compose up -d --build site      # après une modification du code
docker compose stop site && docker compose --profile dev up -d web   # mode développement (rechargement auto, plus lent)
docker compose run --rm migrate npm test                              # tests unitaires
docker compose run --rm -e NODE_ENV=development migrate npx tsx scripts/seed-demo.mts   # 5 demandes FICTIVES
```
Node n'est pas requis sur le poste : tout s'exécute en conteneur. Variables : `.env` (copie de `.env.example`).
Après une modification du schéma : `npm run db:generate` (crée la migration dans `web/drizzle/`), commit, puis `db:migrate` (appliqué automatiquement au démarrage).

## 3. Conventions et choix importants
- **Sécurité par défaut** : toute page/action admin commence par `requirePermission(...)` (`src/lib/auth.ts`). Les permissions sont dans `src/lib/permissions.ts` (3 rôles).
- **Actions serveur** : un seul fichier `admin/actions.ts` ; redirections avec **codes** de message (`admin/flash.ts`), jamais de texte libre dans l'URL.
- **Contenus** : `src/lib/content.ts` contient les textes provisoires (`TBD`) ; les services et paramètres vivent en base (admin).
- **Pages publiques** rendues dynamiquement (lecture base) ; CSP à nonce impose le rendu dynamique.
- **Images** : stockées dans `UPLOAD_DIR` (volume Docker `uploads`), servies par `/media/<nom-aléatoire>`.
- **Validation** : schémas Zod partagés client/serveur (`validation.ts`) ; `z.config({ jitless: true })` obligatoire (CSP sans `eval`).
- **Pas de données personnelles dans les e-mails admin**, pas de cookies côté visiteur, IP pseudonymisées (HMAC avec `APP_SECRET`).
- **Next.js 16** : des conventions diffèrent des versions antérieures (ex. `proxy.ts` au lieu de `middleware.ts`) ; la documentation de la version installée est dans `web/node_modules/next/dist/docs/`.

## 4. Modèle de données (`src/db/schema.ts`)
`users` (rôle, 2FA chiffrée, verrouillage) · `sessions` (jeton haché) · `appointment_requests` (+ `purge_at`, version du consentement) · `categories` · `posts` · `services` · `site_settings` · `audit_log`.

## 5. Variables d'environnement
Voir `.env.example` (dev) et `.env.production.example` (prod). **Aucun secret dans Git** : `.env*` est ignoré (hors `*.example`), les clés de sauvegarde `*.age` aussi.

## 6. SEO
- Un `<title>` + `description` + URL canonique par page ; un seul `<h1>` par page ; `sitemap.xml` (pages, services, articles publiés) et `robots.txt` dynamiques ; JSON-LD `Organization` (site), `Service`, `Article`.
- **Stratégie de référencement local** (sans inventer d'adresse) : (1) dès validation de l'adresse, renseigner *Paramètres du site → Adresse* ; (2) ajouter le JSON-LD `LocalBusiness`/`MedicalBusiness` (type à valider) avec adresse, horaires, téléphone ; (3) créer et vérifier la **fiche Google Business Profile** avec les mêmes NAP (nom, adresse, téléphone) que le site ; (4) page « Informations pratiques » avec la ville dans le contenu et l'accès ; (5) articles de blog locaux et pédagogiques (validés) ; (6) citations cohérentes (annuaires professionnels). Aucune de ces données n'est publiée tant qu'elle n'est pas fournie et validée.
- Le texte alternatif des images du blog est un champ de l'admin (recommandé, non imposé par le logiciel) ; formats WebP/JPEG recommandés.

## 6 bis. Performance
Pages ~5-8 Ko compressées, polices auto-hébergées, aucun script tiers, CSS unique ; p95 ≤ 290 ms en local sous 10 clients simultanés (13). Pistes si besoin : mise en cache des réglages (revalidation par étiquette), CDN UE.

## 7. Tests (`tests/`)
`security_suite.py` (79 contrôles HTTP, nécessite un environnement jetable et un redémarrage de l'app avant chaque exécution pour remettre les limiteurs à zéro) · `perf_check.py` · `browser/run.mjs` (Playwright + axe-core, voir l'en-tête de chaque fichier) · `npm test` (unitaires). **Ne jamais exécuter sur le site réel** : ils créent des comptes et des demandes fictifs.

## 8. Dépendances principales
next, react, drizzle-orm, pg, zod, nodemailer, @node-rs/argon2, qrcode (QR de la 2FA). Dev : drizzle-kit, tsx, vitest, eslint, tailwindcss.
