# Site du Laboratoire Scientifique de la Voix (LSV) — Guide complet

*Rédigé le 2026-11-03. Ce document est le point d'entrée : ce qui a été fait, comment voir le site, comment le modifier (textes, images, informations à confirmer).*

---

## 1. Ce qui a été fait

Un site web professionnel pour le LSV, construit en trois étapes (« sprints »), **entièrement fonctionnel sur l'ordinateur de développement mais pas encore mis en ligne**.

### Sprint 1 — Le site vitrine
- **10 pages** : Accueil, Le laboratoire, Nos services (+ une page par service), La voix (+ une page par trouble), POLYMNIVOX, Références, Actualités, Contact, Informations pratiques, Mentions légales / Confidentialité / Cookies.
- Design validé : bleu pétrole, blanc, gris clair, accents turquoise, onde sonore en illustration ; adapté au mobile, à la tablette et à l'ordinateur.
- Optimisé pour le référencement (titres, descriptions, plan du site, données structurées).

### Sprint 2 — Les demandes de rendez-vous et l'administration
- **Formulaire de demande de rendez-vous** (nom, prénom, e-mail, téléphone, type de demande, créneau souhaité, case de prise de connaissance). Il ne demande **aucun motif médical** et précise que c'est **une demande, pas une réservation**.
- Protections : validation des saisies, anti-spam (champ piège, délai minimal, limitation du nombre d'envois), refus des contenus dangereux.
- Chaque demande reçoit une **référence** (ex. `LSV-2026-A1B2C3`), est enregistrée en base de données, et déclenche **deux e-mails** : une alerte à l'administrateur et une confirmation à la personne.
- **Espace d'administration** (`/admin`) : suivi des demandes (statuts Nouvelle, En attente, Confirmée, Refusée, Traitée), blog (articles, catégories, images, publication programmée), services, coordonnées/horaires/tarifs, utilisateurs et rôles, journal des actions. Droits RGPD : export et suppression d'une demande, purge automatique à échéance.

### Sprint 3 — Sécurité, déploiement, documentation
- Connexion sécurisée + **double authentification** (code sur téléphone, facultative) ; trois rôles : Administrateur, Éditeur, Secrétariat.
- Protections de sécurité du site (CSP, HTTPS, en-têtes, verrouillage après erreurs…).
- **Installation de production prête** (Docker, HTTPS automatique, sauvegardes chiffrées quotidiennes, supervision) — testée en local, **non déployée**.
- **Sauvegarde et restauration testées** : données restaurées identiques.
- Documentation complète (dossier `docs/`) et tests automatiques.

### Résultats des tests (version finale)
| Test | Résultat |
|---|---|
| Tests unitaires | 26 / 26 |
| Tests de sécurité (79 contrôles) | 79 / 79 |
| Navigateurs Chrome, Firefox, Safari (WebKit), mobile/tablette/ordinateur | 108 / 108, aucune erreur |
| Accessibilité automatique (WCAG 2.2 AA) | 0 anomalie |
| Vulnérabilités des dépendances de production | 0 |
| Temps de réponse | 95 % des pages en moins de 0,3 s |
| Restauration d'une sauvegarde | Données identiques |

### Ce qui n'est PAS fait (soyons clairs)
- **Le site n'est pas en ligne** : il n'existe que sur l'ordinateur où il a été construit (domaine et hébergeur à choisir).
- **Tous les textes importants sont provisoires** (marqués `[À CONFIRMER]`) : rien n'a été inventé sur le LSV, le praticien, les tarifs ou les coordonnées.
- **Aucune image réelle** : photo du praticien, schémas POLYMNIVOX et logo sont des emplacements.
- Non testés : vrai serveur, vrai fournisseur d'e-mails, vrais téléphones, test d'intrusion externe.
- Questions juridiques ouvertes : hébergement de données de santé (HDS), durées de conservation (12 mois provisoire), textes légaux.
- Choix pris par défaut (à confirmer) : pas de CAPTCHA, double authentification facultative.

---

## 2. Comment accéder au site

### 2.1 Le site tourne sur VOTRE ordinateur uniquement
Il n'est pas accessible depuis Internet. Quand il est démarré :

| Quoi | Adresse |
|---|---|
| **Site public** | http://localhost:3000 |
| **Administration** | http://localhost:3000/admin |
| **Boîte mail de test** (les e-mails envoyés par le site arrivent ici, pas dans de vraies boîtes) | http://localhost:8025 |

### 2.2 Démarrer / arrêter
Dans un terminal :
```
cd /home/home/lsv-website
docker compose up -d        # démarrer (30 secondes environ)
docker compose stop         # arrêter
docker compose logs -f web  # voir ce qui se passe (Ctrl+C pour quitter)
```
Il faut que Docker soit lancé. Les données (demandes, articles…) sont conservées entre deux arrêts.

### 2.3 Se connecter à l'administration
- **E-mail** : `admin@lsv.example` (compte de développement fictif)
- **Mot de passe** : il est dans le fichier `.env` du projet. Pour l'afficher :
  ```
  grep SEED_ADMIN_PASSWORD /home/home/lsv-website/.env
  ```
- Laissez vide la case « code à 6 chiffres » (la double authentification n'est pas activée sur ce compte de test).
- Le fichier `.env` contient des secrets : **il n'est jamais envoyé sur GitHub** et ne doit être partagé avec personne.

### 2.4 Essayer le parcours complet (5 minutes)
1. Ouvrez http://localhost:3000/contact, remplissez le formulaire avec des **données fictives** (patientez 3 secondes avant d'envoyer : c'est l'anti-spam).
2. Ouvrez http://localhost:8025 : vous voyez l'e-mail d'alerte et l'e-mail de confirmation.
3. Connectez-vous à `/admin` → **Demandes** : la demande est là, statut « Nouvelle ». Changez son statut.
4. Essayez **Articles → Nouvel article**, puis regardez-le dans « Actualités ».

*(Pour voir des demandes d'exemple tout de suite : `docker compose exec web npx tsx scripts/seed-demo.mts` crée 5 demandes fictives.)*

### 2.5 Mettre le site en ligne (pour que tout le monde y accède)
Cela demande des décisions et des comptes à ouvrir **au nom du LSV** (domaine, serveur, e-mails, stockage de sauvegardes) : voir `docs/09-exploitation.md` et `docs/12-couts-et-acces.md`. À ne pas faire avant d'avoir levé les points ouverts (§5).

---

## 3. Comment modifier le site

Il y a **trois niveaux**. Commencez par le plus simple.

### Niveau A — Depuis l'administration (aucune compétence technique)
Connectez-vous à http://localhost:3000/admin. **Le changement est immédiat.**

| Je veux modifier… | Menu | Remarque |
|---|---|---|
| Les **3 services** (description, objectifs, déroulement, infos pratiques, **tarif**) ou en **ajouter** | **Services** | ⚠️ Les services affichés viennent de la base de données : c'est ici qu'il faut les modifier (pas dans le code). Tarif vide = rien d'affiché. |
| Le **téléphone, l'e-mail, l'adresse, les horaires, l'accès, les tarifs** | **Paramètres du site** | S'affichent dans « Informations pratiques » **et** en bas de chaque page. Remplace automatiquement les `[À CONFIRMER]` de ces deux endroits. |
| Les **articles** (ajout, modification, suppression, **image**, date de publication) | **Articles** | Image : JPEG, PNG ou WebP, 3 Mo maximum. Décrivez l'image dans « Texte alternatif ». |
| Les **catégories** d'articles | **Catégories** | |
| Les **comptes** de l'équipe et leurs droits | **Utilisateurs** | |
| Les **demandes** de rendez-vous | **Demandes** | |

Détail pas à pas : `docs/08-documentation-utilisateur.md`.

### Niveau B — Les textes « à confirmer » qui sont dans le code
Ces textes ne sont **pas encore modifiables depuis l'administration** : il faut modifier un fichier. C'est une tâche de 5 minutes pour un technicien, ou vous pouvez me demander de le faire une fois les textes validés.

Tous les fichiers sont dans `web/src/`. **Repérer chaque texte provisoire** :
```
grep -rn "Tbd\|TBD\|À CONFIRMER" web/src
```
Quand vous remplacez un texte, **supprimez aussi la balise jaune** `<Tbd />` (ou `<Tbd>…</Tbd>`) à côté, sinon la pastille « À CONFIRMER » reste affichée.

| Page / zone | Fichier | Quoi changer |
|---|---|---|
| **Accueil** : titre et phrase d'accroche | `app/(site)/page.tsx` (lignes ≈ 20 et 22) | Le titre « Comprendre la voix par la mesure » et le paragraphe sous le titre |
| **Accueil** : présentation du praticien | `app/(site)/page.tsx` (≈ 55) | Parcours résumé de M. Dahdouh |
| **Le laboratoire** : histoire, mission, vision, approche, valeurs | `app/(site)/le-laboratoire/page.tsx` (tableau `blocks`, en haut du fichier) | Un texte par bloc |
| **Le laboratoire** : parcours et qualifications | `app/(site)/le-laboratoire/page.tsx` (≈ 32) | **Uniquement ce qui est justifié** par des diplômes/attestations |
| **La voix** : dysphonies, troubles de l'émission, autres anomalies | `lib/content.ts` (tableau `TOPICS`, ≈ lignes 51-70) | Résumé (`summary`) et texte (`body`) — à faire valider (et relire médicalement si possible) |
| **POLYMNIVOX** : les 6 blocs de présentation | `app/(site)/polymnivox/page.tsx` (tableau `items`, en haut) | Concept, analyse vocale, biomarqueurs, mesure, interprétation, suivi |
| **Mentions légales** | `app/(site)/mentions-legales/page.tsx` | Éditeur, SIRET, directeur de publication, hébergeur — voir `docs/10-dossier-rgpd.md` |
| **Politique de confidentialité** | `app/(site)/confidentialite/page.tsx` | À rédiger **avec validation juridique** (modèle de contenu : `docs/10-dossier-rgpd.md` §2-§4) |
| **Politique de cookies** | `app/(site)/cookies/page.tsx` | Exacte tant qu'aucun traceur n'est ajouté ; la mettre à jour si on ajoute des statistiques |
| **Nom du site, description générale** | `lib/site.ts` | |
| **Menu de navigation** | `lib/site.ts` (tableau `NAV`) | |
| **Textes des services au premier démarrage** | `lib/content.ts` (`SERVICES`) | ⚠️ Ne sert **qu'à l'initialisation** d'une base vide. Pour un site déjà démarré : utilisez l'administration (niveau A). |

**Voir le résultat** : en développement, la page se met à jour toute seule dès que vous enregistrez le fichier (rechargez le navigateur). En production, il faut reconstruire : `./ops/dc up -d --build` (voir `docs/09b-guide-mise-a-jour.md`).

**Références, partenaires, témoignages** (`app/(site)/references/page.tsx`) : la page affiche « Aucun contenu publié ». N'y ajoutez un partenaire ou un témoignage **qu'avec autorisation écrite** ; jamais de données de santé identifiantes.

### Niveau C — Les images
Il n'y a aujourd'hui **aucune image réelle** sur les pages fixes ; il y a trois emplacements gris et un logo texte :

| Emplacement | Fichier | Ligne (≈) |
|---|---|---|
| Schéma POLYMNIVOX (accueil) | `app/(site)/page.tsx` | 42 |
| Photo professionnelle du praticien (accueil) | `app/(site)/page.tsx` | 58 |
| Schéma explicatif (page POLYMNIVOX) | `app/(site)/polymnivox/page.tsx` | 31 |
| Logo (texte « LSV » en haut à gauche) | `components/Header.tsx` | – |
| Icône d'onglet du navigateur | `app/favicon.ico` | remplacer le fichier |

**Pour remplacer un emplacement gris par une image :**
1. Préparez l'image : largeur maximale **1600 px**, format **WebP ou JPEG**, poids idéalement **moins de 300 Ko**. Vous devez avoir **le droit** de l'utiliser (la photo du praticien : accord de la personne).
2. Copiez-la dans `web/public/images/` (créez le dossier), par exemple `praticien.webp`.
3. Dans le fichier, remplacez la ligne `<Placeholder>…</Placeholder>` par :
   ```tsx
   <img src="/images/praticien.webp" alt="M. Fadi Dahdouh, ostéopathe" width={800} height={600} loading="lazy" className="w-full rounded-2xl" />
   ```
   *Écrivez toujours un `alt` utile* (description de l'image) : c'est requis pour l'accessibilité.
4. Pour un schéma, le `alt` doit **expliquer** le schéma en une phrase (« Schéma : un enregistrement vocal est mesuré, puis les indicateurs sont suivis dans le temps »).

**Images des articles de blog** : pas de code, tout se fait dans **Administration → Articles** (champ Image).

### Qui peut faire les modifications de niveau B et C ?
Un développeur web — **ou moi, dans une prochaine session** : donnez-moi les textes validés et les images, je les intègre, je lance les tests et je mets à jour la documentation. Les modifications sont à valider par le LSV **avant** toute mise en ligne.

---

## 4. Où trouver quoi dans le projet

| Je cherche… | Où |
|---|---|
| La liste de tout ce qu'il faut me fournir | `docs/02-informations-a-obtenir.md` |
| Le rapport final et l'état des livrables | `docs/14-rapport-final.md` |
| Le procès-verbal de recette (tests, anomalies, réserves) | `docs/13-pv-de-recette.md` |
| Le choix de la technologie et pourquoi | `docs/03-comparatif-architectures-et-decision.md` |
| Le guide de l'administrateur | `docs/08-documentation-utilisateur.md` |
| La mise en ligne, la supervision, les incidents | `docs/09-exploitation.md` |
| Mettre à jour / revenir en arrière | `docs/09b-guide-mise-a-jour.md` |
| Sauvegardes et restauration | `docs/09c-sauvegarde-restauration.md` |
| RGPD / cybersécurité | `docs/10-dossier-rgpd.md`, `docs/11-dossier-cybersecurite.md` |
| Coûts mensuels, liste des accès à remettre | `docs/12-couts-et-acces.md` |
| Documentation technique (pour un développeur) | `docs/07-documentation-technique.md` |
| Captures d'écran des tests | `docs/captures/` |

---

## 5. Avant de mettre le site en ligne (à décider / fournir)

1. **Avis juridique** sur l'hébergement de données de santé (HDS) : il peut changer l'hébergeur et le coût.
2. **Fournir les contenus** (liste dans `docs/02-informations-a-obtenir.md`) et faire valider tout texte à portée médicale.
3. **Ouvrir au nom du LSV** : nom de domaine, serveur, envoi d'e-mails, stockage de sauvegardes.
4. **Choisir** : durée de conservation des demandes (12 mois proposé), CAPTCHA ou non, double authentification obligatoire ou non.
5. Déployer, refaire les tests sur le vrai serveur, signer le procès-verbal de recette (`docs/13`).

---

## 6. Récupérer le projet depuis GitHub (sur une autre machine)

Dépôt **privé** : https://github.com/gilvanis21-sketch/lsv-website (branche `main`). Ouvrez-le avec votre compte GitHub. Pour donner accès à quelqu'un : *Settings → Collaborators*.
```
git clone https://github.com/gilvanis21-sketch/lsv-website.git && cd lsv-website
cp .env.example .env     # puis renseigner les valeurs (voir ci-dessous)
docker compose up -d
```
Dans `.env`, il faut au minimum : `POSTGRES_PASSWORD` et le même mot de passe dans `DATABASE_URL`, `APP_SECRET` (au moins 32 caractères aléatoires), `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD` (12 caractères minimum). Pour générer un secret : `openssl rand -base64 36`.
Le dépôt ne contient **aucun secret** et **aucune donnée personnelle** : tout fichier `.env*` et toute clé de sauvegarde sont exclus.
