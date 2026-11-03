# 04 — Architecture fonctionnelle et technique proposée (sous réserve de validation de l'option B)

## Pile technique

| Couche | Choix | Raison |
|--------|-------|--------|
| Front + back | Next.js (App Router), TypeScript | Rendu serveur/statique, SEO, un seul code |
| UI | Tailwind CSS + composants accessibles | Design system léger, cohérent |
| Base de données | PostgreSQL + ORM (Drizzle ou Prisma) | Requêtes paramétrées, migrations |
| Auth | Sessions serveur httpOnly (Auth.js ou équivalent), Argon2id, 2FA TOTP admin | Sécurité, rôles |
| Validation | Zod (même schéma client/serveur) | Validation stricte |
| E-mail | SMTP UE (Brevo/Scaleway/OVH, au choix du client) | Notifications transactionnelles |
| Anti-spam | Honeypot + délai minimal + Turnstile/hCaptcha (à valider RGPD) + rate limit | Sans cookie intrusif |
| Médias | Stockage disque/volume ou S3 compatible UE, images optimisées | Blog |
| Reverse proxy | Caddy (TLS auto, redirection HTTPS) | Simplicité |
| Conteneurs | Docker Compose : `app`, `db`, `caddy`, `backup` | Dev/prod séparés |
| Supervision | Uptime Kuma (ou service externe) + logs structurés | Disponibilité + temps de réponse |
| CI | GitHub Actions : lint, tests, audit de dépendances | Qualité |

## Modèle de données (résumé)

`users(id, email, password_hash, role, totp, …)` · `appointment_requests(id, ref, nom, prenom, email, tel, type, creneau_souhaite, consent_at, consent_version, statut, notes_internes, created_at, purge_at)` · `services(id, slug, titre, description, objectifs, deroulement, infos, tarif?, ordre, publie)` · `posts(id, slug, titre, contenu, image, publie_le, statut, auteur)` · `categories` · `site_settings(clé, valeur)` · `audit_log(id, acteur, action, cible, ip_hash, date)`.

Rôles : **Admin** (tout), **Éditeur** (blog, services, contenus), **Secrétariat** (demandes uniquement).

## Flux du formulaire

Visiteur → validation client → `POST /api/demandes` (rate limit, CSRF/origine, honeypot, Zod) → insertion paramétrée → référence `LSV-AAAA-XXXXXX` → e-mail admin + e-mail demandeur (« demande reçue, non confirmée ») → admin change le statut (Nouvelle → En attente → Confirmée / Refusée → Traitée) → purge automatique à échéance définie.

## Arborescence du site

```
/                         Accueil
/le-laboratoire           Histoire, mission, vision, valeurs, praticien
/nos-services             Liste des services
  /nos-services/[slug]    Détail (bilan-vocal, consultation, suivi-vocal, …)
/la-voix                  Espace pédagogique
  /la-voix/[slug]         Dysphonies, troubles de l'émission, …
/polymnivox               Présentation institutionnelle (aucune fonction)
/references               Partenaires, publications, références, témoignages*
/actualites               Blog
  /actualites/[slug]
  /actualites/categorie/[slug]
/contact                  Formulaire de demande de rendez-vous
/informations-pratiques   Coordonnées, adresse, horaires, accès, tarifs
/mentions-legales
/confidentialite
/cookies
/plan-du-site, sitemap.xml, robots.txt
/admin                    (noindex, authentifié)
  /admin/demandes · /admin/articles · /admin/categories · /admin/services
  /admin/parametres · /admin/utilisateurs · /admin/journal
```
\* masqué tant qu'aucun contenu autorisé.

Navigation : Accueil | Le laboratoire | Nos services | La voix | POLYMNIVOX | Actualités | Contact. Les autres pages sont accessibles via le pied de page et les CTA.

## Sprints

1. **Sprint 1** : design system, pages vitrine, contenus provisoires, SEO de base.
2. **Sprint 2** : formulaire, base, e-mails, admin (demandes, blog, services, paramètres, rôles).
3. **Sprint 3** : durcissement sécurité, Docker/prod, sauvegardes, supervision, tests, RGPD, documentation, PV de recette.
