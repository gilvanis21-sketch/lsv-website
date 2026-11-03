# 06 — Sprint 2 : démonstration et limites connues

## Lancer l'environnement de développement
```
cd lsv-website && docker compose up -d      # PostgreSQL + Mailpit + site
```
- Site : http://localhost:3000 — Admin : http://localhost:3000/admin
- Boîte mail de test (Mailpit) : http://localhost:8025
- Identifiants admin de développement : variables `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` du fichier `.env` (jamais committé).
- Tests : `docker compose exec web npm test` — données fictives : `docker compose exec web npx tsx scripts/seed-demo.mts`

## Ce qui est livré
Formulaire de demande (validation client + serveur, honeypot, délai minimal, limite 5/10 min/IP, contrôle d'origine), enregistrement en base, référence `LSV-AAAA-XXXXXX`, e-mails admin + demandeur (texte brut, « demande » et non « réservation »), admin (demandes + statuts + notes + export/suppression RGPD + purge, blog + catégories + images + publication planifiée, services, paramètres du site, utilisateurs/rôles, journal d'audit), sessions serveur, Argon2id, verrouillage après 5 échecs, rôles Admin / Éditeur / Secrétariat.

## Limites connues, traitées au Sprint 3
| Sujet | État |
|---|---|
| CAPTCHA (Turnstile/hCaptcha) | Non ajouté : dépend d'un service tiers à valider RGPD. Honeypot + délai + limitation en place. |
| 2FA administrateur | Non implémentée (recommandée). |
| CSP stricte, HSTS | Sprint 3 (en-têtes de base déjà actifs). |
| Limiteur de débit | En mémoire (instance unique, remis à zéro au redémarrage). |
| Pages publiques | Rendues à la demande (footer lié à la base) ; cache/revalidation à ajouter. |
| Durée de conservation (12 mois) | Valeur provisoire **à valider** (`REQUEST_RETENTION_MONTHS`) ; purge manuelle ou `npm run db:purge` (à planifier). |
| Texte du consentement / politique de confidentialité | Provisoires, à faire valider juridiquement. |
| E-mail admin : pas de coordonnées dedans | Choix de minimisation : seule la référence est envoyée. |
| SMTP de production | À choisir (Mailpit = développement uniquement). |
