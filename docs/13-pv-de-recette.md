# 13 — Procès-verbal de recette

**Projet** : site web du Laboratoire Scientifique de la Voix (LSV) · **Date des essais** : 2026-11-03 · **Version testée** : build de production Docker `lsv-app:local` (Next.js 16.4.4, PostgreSQL 16, Caddy 2), exécutée **en local** avec un domaine `localhost`, des secrets jetables et des **données exclusivement fictives**.

> **Ce que ce PV ne couvre pas** : aucune mise en ligne réelle n'a été faite (domaine et hébergeur non choisis) ; aucun test sur un vrai serveur, un vrai SMTP, de vrais appareils mobiles, d'anciens navigateurs ; aucun test d'intrusion externe. Voir « Réserves ». **Le client n'a pas encore signé la recette.**

## 1. Résultats

| # | Test | Méthode | Résultat |
|---|---|---|---|
| 1 | Tests unitaires (validation, limiteur, références, images, 2FA) | Vitest, 26 tests | **26/26 ✅** |
| 2 | Qualité du code | `tsc --noEmit`, ESLint | **0 erreur ✅** |
| 3 | Build de production | `next build` + image Docker | **✅** (image 340 Mo, utilisateur non-root, FS lecture seule) |
| 4 | Tests d'intégration / formulaire / accès admin / sécurité | `tests/security_suite.py` sur la pile de production (HTTPS) | **79/79 ✅** — détail : `rapport-tests-securite.md` |
| 5 | Navigateurs et responsive | Playwright : Chromium, Firefox, WebKit ; 375 / 768 / 1440 px ; 15 pages ; erreurs console, violations CSP, débordement horizontal ; parcours formulaire complet | **108/108 ✅** |
| 6 | Accessibilité automatisée | axe-core, WCAG 2.0/2.1/2.2 A-AA, 15 pages | **0 violation ✅** (ne remplace pas un audit RGAA manuel) |
| 7 | Performance | `tests/perf_check.py`, 200 requêtes / page, 10 clients simultanés, HTTPS + gzip | p95 ≤ **290 ms** (accueil), ≤ 180 ms ailleurs, **0 erreur** ✅ — `rapport-performance.txt` |
| 8 | Dépendances | `npm audit --omit=dev` | **0 vulnérabilité ✅** |
| 9 | Sauvegarde / restauration | Sauvegarde chiffrée → restauration vers base de test | Données **identiques** (demandes, comptes, services, journal, référence) ✅ ; **mauvaise clé refusée** ✅ ; archive d'images lisible ✅ |
| 10 | Purge RGPD planifiée | Demande expirée + `db:purge` | Supprimée ✅ |
| 11 | HTTPS / redirections | Pile de production | HTTP→HTTPS (308) ✅ ; `www`→domaine (301) ✅ ; HSTS ✅ ; CSP stricte sans `unsafe-eval` ✅ |
| 12 | Double authentification | Activation, mauvais code, bon code, rejeu | ✅ (voir anomalie A7) |
| 13 | E-mails | Mailpit (boîte factice) | Notification admin + confirmation demandeur reçues ✅ (SMTP réel non testé) |

## 2. Anomalies constatées pendant la recette — corrigées
| Réf. | Anomalie | Gravité | Correction |
|---|---|---|---|
| A1 | Next.js limitait les actions serveur à 1 Mo : l'envoi d'une image de 1-3 Mo aurait échoué | Majeure | Limite portée à 4 Mo ; limite métier 3 Mo contrôlée côté serveur |
| A2 | `ops/restore.sh` « sourçait » `.env.production` : plantage dès qu'une valeur contient des espaces | Majeure (restauration impossible) | Lecture sans `source` |
| A3 | L'image de sauvegarde lançait toujours `crond` : la restauration ne s'exécutait jamais | Majeure | `--entrypoint sh` dans la procédure |
| A4 | Firefox : erreur CSP (`eval` bloqué) sur le formulaire — la bibliothèque de validation tentait d'utiliser `eval` | Moyenne | Mode sans `eval` activé avant la définition des schémas |
| A5 | WebKit : `style` refusé par la CSP (annonceur de navigation de Next.js), risque d'élément visible | Moyenne | `style-src-attr 'unsafe-inline'` (attributs seulement) — risque résiduel accepté, dossier 11 |
| A6 | Nom accessible du logo ne contenait pas le texte visible « LSV » (WCAG 2.5.3) sur 14 pages | Moyenne | `aria-label` corrigé |
| A7* | `robots.txt` annonçait `http://localhost:3000/sitemap.xml` (figé à la construction) | Majeure (SEO) | Généré à l'exécution |
| A8 | Accueil bureau : les barres de l'onde chevauchaient le titre | Mineure | Onde réduite et titre borné |
| A9 | Mes premiers scripts de test comportaient des défauts (quoting, comparaison de casse `SameSite`) : faux échecs écartés après vérification de l'en-tête réel (`Secure; HttpOnly; SameSite=strict`) | — | Tests corrigés |

\* numérotation de ce PV.

## 3. Anomalie / point non élucidé
- **P1 — 2FA** : lors d'une première séquence d'essais, un code TOTP valide du « pas suivant » a été refusé une fois ; **non reproduit** sur plusieurs rejeux contrôlés (premier usage accepté, second usage du même code refusé, comme attendu ; vecteurs RFC 4226 corrects ; fenêtre ±1 pas testée en unitaire). Hypothèse : franchissement d'une frontière de 30 s dans le script de test pendant une compilation à froid du mode développement. **À surveiller** ; non bloquant.

## 4. Réserves et points ouverts (à lever avant mise en production)
| # | Réserve | Responsable |
|---|---|---|
| R1 | Contenus provisoires `[À CONFIRMER]` : textes du laboratoire, parcours du praticien, services, troubles de la voix, POLYMNIVOX, coordonnées, horaires, tarifs, mentions légales, politique de confidentialité, références/témoignages (liste : `02-informations-a-obtenir.md`) | Client |
| R2 | **Avis juridique HDS** et validation des durées de conservation (12 mois provisoire) | Client / DPO |
| R3 | Domaine, hébergeur, SMTP, stockage hors site non choisis ; **déploiement réel non réalisé** ; sauvegarde hors site, Uptime Kuma (moniteurs) et alertes à configurer | Client + prestataire |
| R4 | Non testés : appareils mobiles réels, Safari/Edge anciens, lecteurs d'écran, Lighthouse/Core Web Vitals sur serveur réel, charge soutenue, **test d'intrusion indépendant** | Prestataire |
| R5 | Pas de CAPTCHA ; 2FA non obligatoire (recommandée) | Client (décision) |
| R6 | Pages éditoriales (laboratoire, voix, POLYMNIVOX, légal) modifiables seulement dans le code ; images/schémas POLYMNIVOX = emplacements | Client / prestataire |
| R7 | Pas de test réel de la bascule HTTPS publique (Let's Encrypt) : testé uniquement avec le certificat interne de Caddy pour `localhost` | Prestataire |

## 5. Conclusion
Fonctionnellement et techniquement, le site satisfait les exigences testées dans cet environnement. La **mise en production reste subordonnée** à la levée des réserves R1 à R3 au minimum, à un accord écrit du client, à une sauvegarde préalable et au plan de retour arrière (`09b`).

| Validation | Nom | Date | Signature |
|---|---|---|---|
| Client (LSV) | | | |
| Prestataire | | | |
