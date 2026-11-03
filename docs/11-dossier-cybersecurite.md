# 11 — Dossier de cybersécurité

Périmètre : site vitrine + espace d'administration + base de données + sauvegardes. Référentiel : OWASP Top 10. Résultats des tests : `13-pv-de-recette.md` et `rapport-tests-securite.md`. **Aucun test d'intrusion externe n'a été réalisé** (voir limites).

## 1. Mesures par menace
| Menace | Mesures implémentées | Vérifié par |
|---|---|---|
| Injection SQL | ORM Drizzle : requêtes paramétrées partout ; recherche admin échappée | Suite sécurité (injection dans le formulaire et la recherche) ; test unitaire |
| XSS | React échappe par défaut ; **aucun** HTML saisi n'est interprété (corps d'article en texte brut) ; noms refusant `< >` ; **CSP stricte à nonce** (`script-src 'self' 'nonce-…' 'strict-dynamic'`, pas de `unsafe-inline`/`unsafe-eval` en production) ; JSON-LD échappé | Suite sécurité ; 108 contrôles navigateurs sans violation CSP |
| CSRF | Actions serveur Next.js (contrôle d'origine intégré) ; API publique : en-tête `Origin` exigé et identique à l'hôte ; cookie `SameSite=Strict` | Suite sécurité |
| Brute force | Limite 10 connexions / 15 min / IP ; verrouillage du compte 15 min après 5 échecs (y compris mauvais code 2FA) ; message d'erreur générique ; temps de réponse constant (hash factice) | Suite sécurité |
| Vol de session | Jeton aléatoire 256 bits, **haché (SHA-256) en base** ; cookie `__Host-…; Secure; HttpOnly; SameSite=Strict` ; durée 8 h ; sessions révoquées à la désactivation, au changement de rôle et de mot de passe ; déconnexion invalide le jeton | Suite sécurité (jeton réutilisé après déconnexion, jeton forgé) |
| Mots de passe | Argon2id ; 12 caractères minimum | Test unitaire |
| Double authentification | TOTP (RFC 6238) obligatoire dès activation ; anti-rejeu ; secret **chiffré AES-256-GCM** en base ; réinitialisation par un admin | Vecteurs RFC 4226 ; essais bout en bout |
| Contrôle d'accès | 3 rôles ; `requirePermission` au début de **chaque page et chaque action** ; export JSON protégé ; test de rejeu d'une action par un rôle non autorisé | Suite sécurité (secrétariat, éditeur) |
| Spam / abus du formulaire | Honeypot, délai minimal de remplissage, limite 5 / 10 min / IP et 100 / h globale, corps ≤ 8 Ko, JSON strict | Suite sécurité |
| Téléversement malveillant | Type détecté par **signature binaire** (JPEG/PNG/WebP), SVG/HTML refusés, 3 Mo max, nom aléatoire, `nosniff` + `CSP default-src 'none'` à la diffusion, pas de traversée de chemin | Tests unitaires + suite |
| Fuite d'informations | Pas de `X-Powered-By`/`Server` ; erreurs génériques ; ne révèle pas si un compte existe ; l'IP n'est stockée que pseudonymisée | Suite sécurité |
| Interception | HTTPS Caddy (TLS auto), HSTS 2 ans, redirection HTTP→HTTPS, `upgrade-insecure-requests` | Test local de production |
| Clickjacking / divers | `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` | Suite sécurité |
| Compromission d'un conteneur | Utilisateur non-root, système de fichiers en **lecture seule**, `cap_drop: ALL`, `no-new-privileges`, base **sans port publié** (réseau interne) | Inspection du conteneur |
| Perte / vol de sauvegardes | Chiffrement `age` (clé privée hors serveur) ; fichiers en `0600` | Test de restauration (mauvaise clé refusée) |
| Chaîne d'approvisionnement | `npm audit --omit=dev` : **0 vulnérabilité** ; versions verrouillées (`package-lock.json`) ; peu de dépendances directes | Audit du 2026-11-03 |
| Secrets | Hors Git (`.gitignore`), `chmod 600`, jamais dans l'image ; `APP_SECRET` ≥ 32 car. exigé | Revue |

## 2. Risques résiduels et choix assumés
1. **`style-src-attr 'unsafe-inline'`** : autorise les attributs `style=` (pas les balises `<style>`), nécessaire à l'annonceur de navigation accessible de Next.js sous WebKit. Risque faible (injection de style, pas de script).
2. **Limiteurs de débit en mémoire** : remis à zéro au redémarrage ; instance unique. Pour plusieurs instances, prévoir un stockage partagé. Compléter par un pare-feu / fail2ban sur le serveur.
3. **Pas de CAPTCHA** : anti-spam par honeypot/délai/limites ; un robot sophistiqué peut les contourner ; solution tierce à envisager seulement après validation RGPD (cookies/transferts).
4. **IP client** : lue dans `X-Forwarded-For` (fiable seulement derrière Caddy, ce qui est le cas du déploiement). Ne jamais exposer l'application directement.
5. **2FA non obligatoire** : activée par choix de chaque compte ; **recommandation : l'imposer à tous les comptes** par consigne organisationnelle.
6. **Sauvegardes** : sans copie hors site configurée, elles ne protègent pas d'une perte du serveur.
7. **Journal d'audit** modifiable par un administrateur ayant un accès SQL ; pour une exigence forte, exporter vers un stockage en ajout seul.
8. **Rendu des pages publiques** dynamique (lecture base à chaque requête) : une surcharge volontaire est absorbée par la limite du reverse proxy/serveur, pas par un cache applicatif ; prévoir un WAF/CDN UE si trafic hostile.
9. Dépendances de développement : 16 alertes *modérées* dans les outils de lint (non livrés) — suivies.

## 3. Mise en production : checklist sécurité
- [ ] Pare-feu : seuls 22 (clé SSH uniquement), 80, 443 ouverts ; 5432 et 3001 jamais publics.
- [ ] Connexion SSH par clé, mot de passe désactivé, mises à jour automatiques de sécurité du système.
- [ ] `.env.production` en `chmod 600`, secrets uniques générés ; `SEED_ADMIN_*` retirés après initialisation.
- [ ] 2FA activée pour tous les comptes ; mots de passe du gestionnaire.
- [ ] Sauvegarde hors site configurée **et** test de restauration refait sur le serveur final.
- [ ] Supervision configurée (alertes e-mail) ; certificat TLS valide (test SSL Labs ≥ A).
- [ ] Avis juridique (HDS) obtenu ; mentions légales/confidentialité validées.
- [ ] Accès (domaine, hébergeur, dépôt, clés) transférés à LSV (liste en 12).
