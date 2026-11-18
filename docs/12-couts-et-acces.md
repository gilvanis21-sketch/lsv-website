# 12 — Coût mensuel d'exploitation et liste des accès

## 1. Estimation du coût d'exploitation (ordres de grandeur, **à vérifier avec les tarifs en vigueur**)
Hypothèses : trafic faible (site vitrine), un seul serveur, hébergeur dans l'UE.

| Poste | Estimation | Remarque |
|---|---|---|
| Serveur VPS UE (2 vCPU / 2-4 Go) | 6 – 15 € / mois | Docker ; suffisant pour ce trafic |
| Nom de domaine | 1 – 2 € / mois (12 – 25 € / an) | À renouveler chaque année |
| E-mails transactionnels (SMTP UE) | 0 – 10 € / mois | Offres gratuites suffisantes pour quelques dizaines de mails/jour |
| Stockage de sauvegardes hors site | 1 – 3 € / mois | Quelques centaines de Mo |
| Supervision (Uptime Kuma auto-hébergé) | 0 € | Inclus dans le serveur |
| Certificat TLS | 0 € | Let's Encrypt via Caddy |
| **Total infrastructure** | **≈ 8 à 30 € / mois** | |
| Maintenance (mises à jour, restauration test, support) | ≈ 1 – 2 h / mois | Interne ou prestataire : **hors infrastructure, à contractualiser** |

**Écart important si l'hébergement certifié HDS est exigé** (voir dossier RGPD §6) : les offres certifiées coûtent typiquement plusieurs fois plus (de l'ordre de dizaines à centaines d'euros par mois) `[À CHIFFRER après décision]`. L'architecture Docker reste portable.

Coût initial (développement) : voir `03-comparatif-architectures-et-decision.md` — non chiffré ici, à définir contractuellement.

## 2. Liste des accès à remettre à LSV (et qui doit en être titulaire)
Principe : **tout est au nom de LSV** ; le prestataire n'en conserve aucun à la fin de la mission (ou un accès nominatif révocable, tracé).

| Accès | Titulaire attendu | Statut |
|---|---|---|
| Nom de domaine (registrar) + DNS | LSV | `[À créer/transférer]` |
| Compte hébergeur / serveur (console + SSH par clé) | LSV | `[À créer]` |
| Dépôt Git du code source (organisation LSV) | LSV | Dépôt local prêt ; `[À publier sur un compte LSV]` |
| Comptes administrateur du site (≥ 2 administrateurs, 2FA) | LSV | À créer au déploiement |
| Fournisseur d'e-mails (SMTP) | LSV | `[À choisir]` |
| Stockage de sauvegardes hors site | LSV | `[À choisir]` |
| **Mot de passe du dépôt restic** — 2 copies hors serveur | LSV (dirigeant) | À générer et conserver par LSV (09c) |
| Uptime Kuma (compte + alertes e-mail) | LSV | À configurer |
| Fichier `.env.production` (secrets) — copie dans le gestionnaire de mots de passe de LSV | LSV | À constituer |
| Google Business Profile / réseaux sociaux (SEO local) | LSV | `[À fournir]` |

À la remise : session de passation (démo admin, restauration d'une sauvegarde par LSV elle-même), signature du procès-verbal de remise des accès, **changement de tous les mots de passe/secrets** par LSV.
