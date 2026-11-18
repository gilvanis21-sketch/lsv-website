# 15 — Synthèse technique, transfert vers un nouvel ordinateur, mise en ligne

*Rédigé le 2026-11-04. Complète `00-GUIDE-COMPLET.md` et `09-exploitation.md`. Présentation PowerPoint associée : `presentation-lsv.pptx`.*

> **Statut** : le site fonctionne en local. **Rien n'est déployé.** Les commandes de la partie 3 (Windows) n'ont **pas été testées sur Windows** : seules les commandes Linux ont été exécutées sur ce poste.

---

## 1. Ce qui a été réalisé (explication technique)

### 1.1 Décision d'architecture
Trois options ont été comparées par une matrice pondérée sur 10 critères (`03-comparatif-architectures-et-decision.md`) : constructeur de site (3,48/5), **Next.js + PostgreSQL conteneurisé (3,68/5)**, WordPress (3,30/5). L'option B a été validée par le client le 2026-11-03. L'écart est faible ; elle l'emporte sur le besoin fonctionnel (demandes, rôles, purge) et la maîtrise des données personnelles.

### 1.2 Stack
| Couche | Technologie | Rôle |
|---|---|---|
| Langage | TypeScript / TSX | Toute l'application, côté serveur et navigateur |
| Framework | Next.js 16 (App Router), React 19 | Pages rendues côté serveur, actions serveur, SEO |
| Base de données | PostgreSQL 16 + Drizzle ORM | 8 tables, requêtes typées, migrations SQL versionnées |
| Validation | Zod | Toutes les saisies sont validées côté serveur |
| Style | Tailwind CSS 4 | Design responsive |
| Authentification | Argon2 (`@node-rs/argon2`), TOTP (`lib/totp.ts`) | Mots de passe hachés, double authentification facultative |
| E-mails | Nodemailer ; Mailpit en local | Alerte à l'admin + confirmation au demandeur |
| Conteneurs | Docker, Docker Compose | Même image en local et en production |
| Reverse proxy | Caddy | HTTPS automatique (Let's Encrypt) |
| Tests | Vitest, Python (sécurité, performance), Playwright + axe | Voir 1.5 |
| Exploitation | Shell, `age` (chiffrement), Uptime Kuma | Sauvegardes, restauration, supervision |

### 1.3 Organisation du code
```
lsv-website/
├─ docker-compose.yml          # local : db + mailpit + migrate + site (build de production)
├─ docker-compose.prod.yml     # production : caddy, app, migrate, db, backup, uptime
├─ ops/                        # Caddyfile, backup/, restore.sh, dc
├─ tests/                      # security_suite.py, perf_check.py, browser/
├─ docs/                       # documentation (00 à 15) et rapports
└─ web/
   ├─ src/app/(site)/          # pages publiques
   ├─ src/app/admin/           # connexion + panneau + actions serveur
   ├─ src/app/api/             # POST /api/demandes, GET /api/health
   ├─ src/proxy.ts             # CSP avec nonce, HSTS
   ├─ src/lib/                 # auth, totp, validation, ratelimit, mail, uploads, audit…
   ├─ src/db/schema.ts         # schéma (8 tables) ; migrations dans web/drizzle/
   └─ scripts/                 # migrate, seed, seed-demo, purge
```

### 1.4 Fonctionnement
- **Site public** : 10 pages + une page par service et par trouble de la voix ; blog avec catégories et publication programmée ; SEO (métadonnées, `sitemap.ts`, `robots.ts`, données structurées).
- **Demande de rendez-vous** : formulaire sans motif médical → validation Zod → anti-spam (champ piège, délai minimal de 3 s, limitation de débit) → enregistrement avec référence (`LSV-2026-XXXXXX`) → deux e-mails.
- **Administration** (`/admin`) : demandes (5 statuts), articles, catégories, services, paramètres (coordonnées, horaires, tarifs), utilisateurs et rôles (Administrateur, Éditeur, Secrétariat), journal d'audit. RGPD : export et suppression d'une demande, purge automatique (`db:purge`, durée `REQUEST_RETENTION_MONTHS`, 12 mois provisoire).
- **Sécurité** : CSP stricte avec nonce par requête, HSTS en HTTPS, en-têtes (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`), verrouillage après erreurs de connexion, images contrôlées (3 Mo, JPEG/PNG/WebP), conteneur applicatif non-root et en lecture seule, base de données sur un réseau Docker interne.
- **Production prête, non déployée** : sauvegarde quotidienne chiffrée (`age`), restauration scriptée et testée, supervision Uptime Kuma.

### 1.5 Résultats de tests (3 novembre 2026, poste de développement)
26/26 tests unitaires · 79/79 contrôles de sécurité · 108/108 tests navigateurs (Chromium, Firefox, WebKit ; mobile, tablette, ordinateur) · 0 anomalie axe (WCAG 2.2 AA) · 0 vulnérabilité des dépendances de production · 95 % des pages en moins de 0,3 s · restauration de sauvegarde : données identiques.
**Non testé** : serveur réel, fournisseur d'e-mails réel, vrais téléphones, test d'intrusion externe.

### 1.6 Vérification du jour (typecheck)
`tsc --noEmit` exécuté dans un conteneur `node:22-alpine` : code de sortie 0, aucune erreur de type. Aucun fichier n'a été modifié pour cela.

### 1.7 Limites à connaître
Contenus provisoires (`[À CONFIRMER]`), aucune image réelle, question HDS ouverte, CAPTCHA non retenu, 2FA facultative, limiteur de débit **en mémoire** (valable pour une seule instance du serveur : voir 3.3).

---

## 2. Ce qui est dans le dépôt et ce qui n'y est pas

| Élément | Dans Git ? | Conséquence pour le transfert |
|---|---|---|
| Code, Dockerfile, docker-compose, docs, tests | Oui | Se récupère avec `git clone` |
| `.env` (mots de passe, secrets) | **Non** (ignoré) | À recréer sur le nouvel ordinateur depuis `.env.example` |
| Données de la base (demandes, articles de test) | **Non** (volume Docker `pgdata`) | Repartent vides + seed ; données de dev fictives, sans intérêt à migrer |
| Images téléversées (volume `uploads`) | **Non** | Idem |
| Dépôt privé GitHub | — | Le nouvel ordinateur doit pouvoir s'authentifier sur GitHub |

---

## 3. Installer le site sur un ordinateur neuf

**Node.js n'est pas nécessaire** : tout passe par Docker. Prérequis communs : Docker avec Compose v2, Git, 4 Go de RAM libres, ports locaux 3000, 5432, 8025 et 1025 libres.

### 3.1 Linux (testé sur ce poste)
1. Installer Docker Engine + plugin Compose et Git (selon la distribution ; ex. Debian/Ubuntu : `sudo apt install git docker.io docker-compose-v2`, Arch/CachyOS : `sudo pacman -S git docker docker-compose`).
2. Démarrer Docker et autoriser votre utilisateur :
   ```
   sudo systemctl enable --now docker
   sudo usermod -aG docker $USER      # puis se déconnecter / reconnecter
   ```
3. Récupérer le code (authentification GitHub requise, le dépôt est privé : jeton d'accès personnel ou clé SSH) :
   ```
   git clone https://github.com/gilvanis21-sketch/lsv-website.git
   cd lsv-website
   ```
4. Créer le fichier d'environnement :
   ```
   cp .env.example .env
   chmod 600 .env
   id -u; id -g          # reporter ces valeurs dans LOCAL_UID et LOCAL_GID
   ```
   Renseigner dans `.env` : `POSTGRES_PASSWORD`, `DATABASE_URL` (même mot de passe, hôte `db`, format du `.env.example`), `APP_SECRET` (`openssl rand -base64 36`), `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` (12 caractères minimum). Garder `SMTP_HOST=mailpit`, `SMTP_PORT=1025`.
5. Démarrer :
   ```
   docker compose up -d
   ```
   Le premier démarrage construit l'image (1 à 3 minutes), applique les migrations et crée le compte admin (service `migrate`).
6. Vérifier : http://localhost:3000 (site), http://localhost:3000/admin (connexion avec `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`), http://localhost:8025 (boîte mail de test), http://localhost:3000/api/health.
7. Arrêter : `docker compose stop`. Voir les journaux : `docker compose logs -f site`.
8. Après toute modification du code : `docker compose up -d --build site`.

### 3.2 Windows 10/11
1. Activer la virtualisation dans le BIOS si besoin, puis dans PowerShell **administrateur** : `wsl --install` et redémarrer.
2. Installer **Docker Desktop** (moteur WSL 2 activé) et **Git for Windows**. Vérifier : `docker version` et `docker compose version`.
3. **Avant de cloner**, empêcher la conversion des fins de ligne (les scripts shell du dossier `ops/` et les conteneurs Linux exigent des fins de ligne LF) :
   ```
   git config --global core.autocrlf false
   ```
4. Cloner dans un dossier **sous WSL** (plus rapide et plus fiable) ou sous `C:\Users\<vous>\` :
   ```
   git clone https://github.com/gilvanis21-sketch/lsv-website.git
   cd lsv-website
   copy .env.example .env
   ```
5. Éditer `.env` (Bloc-notes ou VS Code, **encodage UTF-8, fins de ligne LF**) : `LOCAL_UID=1000` et `LOCAL_GID=1000` (valeurs sans effet sous Docker Desktop pour le service par défaut), `POSTGRES_PASSWORD`, `DATABASE_URL`, `APP_SECRET`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`. Générer un secret en PowerShell :
   ```
   [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(36))
   ```
6. Démarrer : `docker compose up -d`, puis ouvrir les mêmes adresses qu'en 3.1 (étape 6).
7. Si le pare-feu Windows demande une autorisation pour Docker, l'accepter sur les réseaux privés uniquement.

> Points de vigilance Windows : (a) `./ops/dc` et `ops/restore.sh` sont des scripts shell : les lancer depuis **WSL** ou Git Bash, pas depuis PowerShell ; (b) les tests Python de `tests/` ne sont pas nécessaires pour faire tourner le site ; (c) ces étapes n'ont pas été exécutées sur Windows.

### 3.3 Transférer aussi les données (facultatif)
Les données de développement sont fictives : le plus simple est de repartir à vide. Si vous tenez à les copier, sur l'ancien poste :
```
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > lsv-dev.sql
```
Sur le nouveau, après `docker compose up -d` :
```
docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"' < lsv-dev.sql
```
(Cette procédure n'a pas été testée ; ne jamais l'utiliser avec de vraies données sans sauvegarde chiffrée, voir `09c`.)

### 3.4 Problèmes fréquents
| Symptôme | Cause probable | Action |
|---|---|---|
| `permission denied` sur le socket Docker (Linux) | utilisateur hors du groupe `docker` | `usermod -aG docker`, reconnexion |
| Port 3000 ou 5432 déjà utilisé | autre service local | l'arrêter, ou changer le port à gauche dans `docker-compose.yml` |
| `exec ... no such file or directory` au démarrage d'un script | fins de ligne CRLF (Windows) | `core.autocrlf false`, re-cloner |
| Connexion admin refusée | `.env` modifié après la première création | le compte est créé une seule fois ; changer le mot de passe depuis l'admin, ou `docker compose down -v` pour repartir à vide (**efface la base locale**) |
| Page blanche / erreur 500 | migrations non appliquées | `docker compose logs migrate site` |

---

## 4. Mettre le site en ligne

**Prérequis non techniques (à lever d'abord)** : avis juridique HDS, contenus validés, accès ouverts au nom du LSV (domaine, hébergeur, SMTP, stockage de sauvegardes). Voir `00-GUIDE-COMPLET.md` §5 et `12-couts-et-acces.md`. Pas de mise en production sans accord écrit, sauvegarde préalable et retour arrière.

### 4.1 Option recommandée : VPS dans l'UE avec Docker (prête dans le dépôt)
Coût indicatif 8 à 30 € / mois (à vérifier). Hébergeurs UE courants : OVHcloud, Scaleway, Hetzner, Infomaniak. Étapes, détaillées dans `09-exploitation.md` :
1. Louer un VPS Linux (2 vCPU, 2 à 4 Go), installer Docker + Compose, clé SSH, pare-feu (ouvrir 22, 80, 443 uniquement).
2. Acheter le domaine ; créer les enregistrements DNS `A` (et `AAAA`) pour `domaine` et `www.domaine` vers l'IP du serveur.
3. Cloner le dépôt sur le serveur ; `cp .env.production.example .env.production` ; remplir (`DOMAIN`, `ACME_EMAIL`, secrets, SMTP réel, clé **publique** `age`, `BACKUP_OFFSITE_CMD`) ; `chmod 600`.
4. `./ops/dc up -d --build` puis `./ops/dc --profile bootstrap run --rm bootstrap` (création unique du compte admin), puis supprimer `SEED_ADMIN_*`.
5. Vérifier `https://domaine/api/health`, la redirection HTTPS, la connexion `/admin`, l'envoi d'un vrai e-mail ; activer la 2FA ; configurer Uptime Kuma ; tester une restauration.

### 4.2 Conteneurs gérés dans l'UE (PaaS)
Même `Dockerfile` (cible `runner`), base PostgreSQL gérée, variables d'environnement du `.env.production.example`. Moins d'administration, coût plus élevé. Deux points à traiter : le dossier d'images (`UPLOAD_DIR`) doit être un volume persistant, et les sauvegardes dépendent de l'offre.

### 4.3 Vercel : possible, mais pas « tel quel »
Vercel exécute Next.js en fonctions sans état. Ce projet a trois dépendances qui ne s'y prêtent pas sans modification de code :

| Point | Situation actuelle | Adaptation nécessaire |
|---|---|---|
| Images téléversées | écrites sur le disque (`src/lib/uploads.ts`, `UPLOAD_DIR`) ; le disque de Vercel n'est pas persistant | Stockage objet (par ex. Vercel Blob) et adaptation de `uploads.ts` et de la route `/media/[name]` |
| Limiteur anti-spam / verrouillage | tableau en mémoire (`src/lib/ratelimit.ts`) ; chaque instance a le sien | Stockage partagé (Redis / Upstash) |
| Base de données | PostgreSQL du conteneur | PostgreSQL externe (Neon via la Marketplace Vercel, ou autre) ; migrations à lancer à chaque déploiement |
| Sauvegardes | service `backup` Docker | Sauvegardes du fournisseur de base de données |

Et un point de fond : Vercel est un prestataire américain ; même avec une région européenne, la question HDS / données personnelles de santé doit être tranchée **avant** (voir `10-dossier-rgpd.md` §6). Si ce point est levé, Vercel convient bien à un site vitrine ; c'est à chiffrer comme un petit chantier d'adaptation, pas comme un simple « déployer ».

Pour un **aperçu de démonstration sans vraies données** (jamais de données personnelles réelles) : lier le dépôt à un projet Vercel, définir les variables d'environnement, brancher une base de test, accepter que l'envoi d'images soit désactivé tant que `uploads.ts` n'est pas adapté.

### 4.4 À éviter
Un constructeur de site ou WordPress obligerait à reconstruire l'espace d'administration (voir la matrice du document 03). Un hébergement mutualisé classique ne fait pas tourner Docker/PostgreSQL de cette façon.

### 4.5 Après la mise en ligne
Sauvegarde hors site vérifiée, restauration testée sur le serveur, tests de sécurité et de performance refaits sur le vrai domaine (`tests/`, environnement jetable uniquement), SSL Labs, procès-verbal de recette (`13`), passation des accès au LSV (`12`).
