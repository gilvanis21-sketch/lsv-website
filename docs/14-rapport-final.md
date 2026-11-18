# 14 — Rapport final de projet (Sprints 1 à 3)

**Projet** : site web du Laboratoire Scientifique de la Voix · **Date** : 2026-11-03 · **Statut** : développement et recette technique terminés **en environnement local** ; **mise en production non réalisée** (en attente des décisions et contenus du client).

## 1. Livrables
| # | Livrable (cahier des charges §12) | État | Où |
|---|---|---|---|
| 1 | Site opérationnel et déployé | **Opérationnel en local ; non déployé** (domaine/hébergeur à choisir) | `docker-compose.prod.yml`, `09-exploitation.md` |
| 2 | Code source dans un dépôt Git | Dépôt local prêt ; **aucun commit n'a été fait** ; à publier sur un compte LSV | `/lsv-website` |
| 3 | Documentation technique | ✅ | `07` |
| 4 | Documentation utilisateur | ✅ | `08` |
| 5 | Documentation d'exploitation | ✅ (testée en local) | `09` |
| 6 | Guide de mise à jour | ✅ | `09b` |
| 7 | Sauvegarde et restauration | ✅ **restauration testée** | `09c`, `ops/` |
| 8 | Dossier RGPD | ✅ projet, **à valider juridiquement** | `10` |
| 9 | Dossier cybersécurité | ✅ | `11`, `rapport-tests-securite.md` |
| 10 | Tableau de bord de supervision | **Livré (Uptime Kuma) ; moniteurs à configurer au déploiement** | `09` §4 |
| 11 | Comparatif des solutions | ✅ | `03` |
| 12 | Estimation du coût mensuel | ✅ ordres de grandeur à vérifier | `12` |
| 13 | Liste des accès remis | ✅ liste ; **accès à créer** | `12` |
| 14 | Rapport final | ✅ | ce document |
+ PV de recette : `13` · informations à obtenir : `02` · maquettes : `05`, `maquettes/`.

## 2. Ce qui a été réalisé
- **Sprint 1** — site vitrine : 10 pages, design validé (bleu pétrole/turquoise, onde sonore), SEO de base, contenus provisoires signalés.
- **Sprint 2** — formulaire de demande de rendez-vous (validation client/serveur, anti-spam, limitation de débit, e-mails, référence), base PostgreSQL, administration complète (demandes et statuts, blog, services, paramètres, utilisateurs et rôles, journal), droits RGPD (export, suppression, purge).
- **Sprint 3** — durcissement (CSP à nonce, HSTS, double authentification TOTP, session et verrouillage), images Docker de production (non-root, lecture seule), reverse proxy HTTPS, sauvegardes chiffrées et **restauration testée**, supervision, documentation, tests (unitaires, 79 contrôles de sécurité, 108 contrôles navigateurs, accessibilité automatisée, performance, audit des dépendances).

## 3. Conformité aux règles du cahier des charges
Aucune information inventée sur le LSV, le praticien, les tarifs ou les coordonnées (tout est `[À CONFIRMER]`) · aucun témoignage ni donnée de santé · aucun motif médical demandé · aucune IA, aucun traitement audio, POLYMNIVOX présenté uniquement · données de test **exclusivement fictives** (`.example`) · aucun secret dans le dépôt · **rien n'a été mis en production**.

## 4. Décisions que j'ai prises sans votre réponse explicite (à confirmer ou corriger)
Vous avez répondu « oui » au passage au Sprint 3 sans trancher les trois points en suspens ; j'ai appliqué mes recommandations :
1. **Durée de conservation des demandes : 12 mois** (provisoire) ;
2. **pas de CAPTCHA** (anti-spam maison) ;
3. **2FA ajoutée**, mais non imposée à tous les comptes.
Autres choix : SMTP quelconque (Mailpit en dev), sauvegarde `restic` vers un dépôt hors site obligatoire, supervision par Uptime Kuma auto-hébergé.

## 5. Restes à faire avant mise en production (par ordre de priorité)
1. **Avis juridique HDS** + validation RGPD (mentions légales, confidentialité, durées).
2. Fournir les contenus (`02`) ; faire valider tous les textes à portée médicale.
3. Choisir et ouvrir **au nom de LSV** : domaine, serveur, SMTP, stockage hors site.
4. Déployer, configurer sauvegarde hors site + supervision + alertes, **refaire** le test de restauration et les tests de sécurité sur la cible.
5. Test d'intrusion indépendant (recommandé), audit d'accessibilité manuel (RGAA), test sur appareils réels.
6. Passation : démonstration, restauration par LSV elle-même, changement de tous les secrets, signature du PV.

## 6. Évolutions possibles
Pages éditoriales modifiables depuis l'admin · mise en cache des pages publiques · CAPTCHA conforme RGPD si le spam devient un problème · statistiques sans cookie (type Plausible/Matomo sans traceur, à valider) · rappel au demandeur lors du changement de statut.
