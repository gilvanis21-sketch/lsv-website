# Résultats de la suite de sécurité

Cible : `https://localhost` — 79/79 contrôles réussis.

| Domaine | Contrôle | Résultat |
|---|---|---|
| En-têtes | / : CSP à nonce, sans unsafe-inline | ✅ |
| En-têtes | / : pas de unsafe-eval (production) | ✅ |
| En-têtes | / : HSTS | ✅ |
| En-têtes | / : X-Frame-Options DENY + frame-ancestors | ✅ |
| En-têtes | / : nosniff + Referrer-Policy + Permissions-Policy | ✅ |
| En-têtes | / : pas de X-Powered-By ni de version serveur | ✅ |
| En-têtes | / : aucun cookie déposé aux visiteurs | ✅ |
| En-têtes | / : nonce réellement appliqué aux scripts | ✅ |
| En-têtes | /admin/login : CSP à nonce, sans unsafe-inline | ✅ |
| En-têtes | /admin/login : pas de unsafe-eval (production) | ✅ |
| En-têtes | /admin/login : HSTS | ✅ |
| En-têtes | /admin/login : X-Frame-Options DENY + frame-ancestors | ✅ |
| En-têtes | /admin/login : nosniff + Referrer-Policy + Permissions-Policy | ✅ |
| En-têtes | /admin/login : pas de X-Powered-By ni de version serveur | ✅ |
| En-têtes | /admin/login : aucun cookie déposé aux visiteurs | ✅ |
| En-têtes | /admin/login : nonce réellement appliqué aux scripts | ✅ |
| En-têtes | /contact : CSP à nonce, sans unsafe-inline | ✅ |
| En-têtes | /contact : pas de unsafe-eval (production) | ✅ |
| En-têtes | /contact : HSTS | ✅ |
| En-têtes | /contact : X-Frame-Options DENY + frame-ancestors | ✅ |
| En-têtes | /contact : nosniff + Referrer-Policy + Permissions-Policy | ✅ |
| En-têtes | /contact : pas de X-Powered-By ni de version serveur | ✅ |
| En-têtes | /contact : aucun cookie déposé aux visiteurs | ✅ |
| En-têtes | /contact : nonce réellement appliqué aux scripts | ✅ |
| Accès admin | /admin sans session → redirection connexion | ✅ |
| Accès admin | /admin/demandes sans session → redirection connexion | ✅ |
| Accès admin | /admin/articles sans session → redirection connexion | ✅ |
| Accès admin | /admin/articles/nouveau sans session → redirection connexion | ✅ |
| Accès admin | /admin/categories sans session → redirection connexion | ✅ |
| Accès admin | /admin/services sans session → redirection connexion | ✅ |
| Accès admin | /admin/parametres sans session → redirection connexion | ✅ |
| Accès admin | /admin/utilisateurs sans session → redirection connexion | ✅ |
| Accès admin | /admin/journal sans session → redirection connexion | ✅ |
| Accès admin | /admin/securite sans session → redirection connexion | ✅ |
| Accès admin | export JSON sans session → 401 | ✅ |
| Disponibilité | /api/health → ok sans détail | ✅ |
| API demande | sans en-tête Origin → 403 (anti-CSRF) | ✅ |
| API demande | origine étrangère → 403 | ✅ |
| API demande | Content-Type non JSON → 415 | ✅ |
| API demande | GET interdit → 405 | ✅ |
| API demande | JSON invalide → 400 | ✅ |
| API demande | corps > 8 Ko → 413 | ✅ |
| API demande | honeypot rempli → faux succès, rien d'enregistré | ✅ |
| API demande | XSS dans le prénom → 422 | ✅ |
| API demande | tentative d'injection SQL → traitée comme texte (201) | ✅ |
| API demande | limitation de débit → 429 au-delà de 5 / 10 min | ✅ |
| API demande | erreurs sans trace technique | ✅ |
| Authentification | mauvais mot de passe → message générique | ✅ |
| Authentification | connexion admin valide | ✅ |
| Session | cookie nommé __Host-lsv_session | ✅ |
| Session | cookie HttpOnly + SameSite=Strict | ✅ |
| Session | cookie Secure | ✅ |
| Session | jeton long (≥ 40 car.) | ✅ |
| Autorisations | secrétariat : demandes accessibles | ✅ |
| Autorisations | secrétariat : /admin/articles refusé | ✅ |
| Autorisations | secrétariat : /admin/services refusé | ✅ |
| Autorisations | secrétariat : /admin/parametres refusé | ✅ |
| Autorisations | secrétariat : /admin/utilisateurs refusé | ✅ |
| Autorisations | secrétariat : /admin/journal refusé | ✅ |
| Autorisations | éditeur : articles accessibles | ✅ |
| Autorisations | éditeur : /admin/demandes refusé | ✅ |
| Autorisations | éditeur : /admin/utilisateurs refusé | ✅ |
| Autorisations | éditeur : /admin/journal refusé | ✅ |
| Autorisations | éditeur : export de données refusé (401) | ✅ |
| Autorisations | éditeur : action serveur « supprimer demande » rejouée → refusée, donnée intacte | ✅ |
| Authentification | verrouillage du compte après 5 échecs | ✅ |
| Injection | recherche admin : injection SQL sans effet | ✅ |
| XSS | paramètre de recherche non réfléchi en HTML brut | ✅ |
| XSS | paramètre de catégorie non réfléchi | ✅ |
| Erreurs | /admin/demandes/pas-un-uuid → 404 sans fuite technique | ✅ |
| Erreurs | /nos-services/inexistant → 404 sans fuite technique | ✅ |
| Erreurs | /actualites/inexistant → 404 sans fuite technique | ✅ |
| Erreurs | /media/../../etc/passwd → 404 sans fuite technique | ✅ |
| Erreurs | /media/evil.html → 404 sans fuite technique | ✅ |
| Erreurs | /n-importe-quoi → 404 sans fuite technique | ✅ |
| Téléversement | HTML déguisé en PNG refusé | ✅ |
| Téléversement | SVG refusé (vecteur XSS) | ✅ |
| Session | jeton réutilisé après déconnexion → rejeté | ✅ |
| Session | jeton forgé → rejeté | ✅ |
