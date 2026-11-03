# 09b — Guide de mise à jour du site

## A. Mettre à jour les CONTENUS (aucune compétence technique)
Tout se fait dans l'administration (`https://domaine/admin`), voir le guide utilisateur (08) : textes des services, articles, coordonnées, horaires, tarifs.
Les pages **« Le laboratoire », « La voix », « POLYMNIVOX », mentions légales et confidentialité** sont, pour l'instant, des textes dans le code : leur modification demande une intervention technique (prestataire).

## B. Mettre à jour l'APPLICATION (technicien)
**Avant toute chose : sauvegarde manuelle et accord écrit du client.**
```
./ops/dc exec backup /usr/local/bin/backup.sh        # 1. sauvegarde immédiate
git pull                                              # 2. récupérer la nouvelle version
APP_VERSION=2026-11-15 ./ops/dc up -d --build         # 3. reconstruit et redémarre (migrations auto)
curl -fs https://domaine/api/health                   # 4. vérifier
```
Contrôles après mise à jour : accueil, formulaire (envoyer une demande **fictive**, puis la supprimer dans l'admin), connexion admin.

## C. Retour arrière
Application seule (sans changement de base) :
```
git checkout <version-précédente> && APP_VERSION=<version-précédente> ./ops/dc up -d --build
```
Si une migration de base a été appliquée : restaurer la sauvegarde faite à l'étape 1 (procédure `09c`), puis redéployer la version précédente. Les migrations actuelles ne font qu'**ajouter** des colonnes/tables : un retour arrière applicatif seul reste compatible.

## D. Mises à jour de sécurité des dépendances
- Contrôle mensuel : `cd web && npm audit --omit=dev` (doit afficher *0 vulnerabilities*) ; `npm outdated`.
- Appliquer : `npm update`, puis `npm test && npm run lint && npm run build`, puis la procédure B.
- Mettre à jour aussi les images de base (`docker compose pull` pour Caddy/PostgreSQL ; PostgreSQL : rester sur la version majeure 16 tant qu'une migration planifiée n'a pas été préparée).

## E. Ce qu'il ne faut jamais faire
Modifier un fichier dans un conteneur en marche · committer `.env.production` · supprimer le volume `pgdata` · publier le port 5432 · lancer les scripts de test sur le site réel (`tests/` crée des comptes fictifs).
