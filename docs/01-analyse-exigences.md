# 01 — Analyse du cahier des charges LSV

Phase 1-2 (découverte, cadrage, diagnostic). Statut : **proposition, en attente de validation**.

## 1. Périmètre

**Dans le périmètre** : site vitrine institutionnel (10 pages), blog administrable, formulaire de demande de rendez-vous, back-office (demandes, blog, services, infos du site, utilisateurs/rôles), conformité RGPD, sécurité, déploiement, supervision, sauvegardes, documentation.

**Hors périmètre (explicite)** : moteur d'analyse vocale, IA, traitement audio, fonctionnalités de POLYMNIVOX (présentation uniquement), prise de rendez-vous confirmée en temps réel, paiement en ligne, espace patient, dossier médical.

## 2. Exigences fonctionnelles

| ID | Exigence | Priorité |
|----|----------|----------|
| F1 | 10 pages publiques (accueil, laboratoire, services, voix, POLYMNIVOX, références, actualités, contact, infos pratiques, légal) | Must |
| F2 | Services en base de données : ajout d'un service sans toucher au code (description, objectifs, déroulement, infos pratiques, tarif optionnel) | Must |
| F3 | Formulaire de demande de RDV : nom/prénom, e-mail, téléphone, type (1ʳᵉ consultation / suivi), créneau souhaité, consentement. **Aucun motif médical.** | Must |
| F4 | Validation client + serveur, anti-spam, rate limiting | Must |
| F5 | Enregistrement en base, identifiant de demande, e-mail admin + e-mail de confirmation au demandeur (libellé « demande », jamais « réservation confirmée ») | Must |
| F6 | Statuts : Nouvelle, En attente, Confirmée, Refusée, Traitée | Must |
| F7 | Blog : CRUD articles, catégories, images, date de publication (planifiable) | Must |
| F8 | Back-office authentifié avec rôles (ex. Admin, Éditeur, Secrétariat) | Must |
| F9 | Gestion des infos du site (coordonnées, horaires, tarifs) depuis l'admin | Must |
| F10 | Bandeau de consentement cookies + pages légales | Must |
| F11 | Export / suppression des données d'un demandeur (droits RGPD) ; purge automatique à échéance | Must |
| F12 | Références & témoignages : module masqué tant qu'aucun contenu autorisé | Should |

## 3. Exigences non fonctionnelles

- **Sécurité** : OWASP Top 10, requêtes paramétrées, échappement XSS, CSP/HSTS, CSRF, sessions sécurisées, mots de passe Argon2id, verrouillage anti-brute-force, 2FA admin (recommandé), journal d'audit.
- **RGPD** : minimisation, base légale par traitement, durées de conservation, registre des traitements, mentions d'information, hébergement UE.
- **Performance** : LCP < 2,5 s sur mobile, pages publiques pré-rendues/mises en cache.
- **Accessibilité** : cible RGAA / WCAG 2.2 AA (contrastes, clavier, labels, `prefers-reduced-motion`).
- **SEO** : title/meta par page, hn cohérents, sitemap, robots, JSON-LD (Organization, MedicalBusiness à valider, Article), SEO local sans adresse inventée.
- **Exploitabilité** : Docker, dev/prod séparés, secrets hors Git, sauvegardes + restauration testée, logs, supervision uptime/temps de réponse.
- **Maintenabilité** : code modulaire, documenté, utilisable par une personne non technicienne via l'admin.
- **Souveraineté** : domaine et hébergement au nom de LSV.

## 3 bis. Points de vigilance juridique (à faire valider)

1. **Données de santé / HDS** : une demande « suivi » ou « première consultation » avec nom + coordonnées révèle un lien patient–praticien. Faire confirmer par un juriste/DPO si l'hébergement doit être certifié HDS. Hypothèse de travail : données minimales (pas de motif médical) et hébergement UE ; **à valider**, non tranché ici.
2. **Base légale** : le traitement de la demande relève plutôt de mesures précontractuelles/intérêt légitime ; le consentement est réservé aux traitements qui en ont besoin (cookies non essentiels, newsletter). La case du formulaire sert à l'information et à la preuve, pas de justificatif universel.
3. **Allégations de santé** : l'ostéopathie et l'analyse vocale sont encadrées ; aucun contenu thérapeutique sans validation du client.
4. **Mentions légales** : identité, SIRET, hébergeur, directeur de publication : à fournir.

## 4. Risques

| Risque | Impact | Mitigation |
|--------|--------|-----------|
| Contenus non fournis (textes, photos, tarifs) | Retard | Contenus provisoires marqués `[À CONFIRMER]` + liste 02 |
| Allégation médicale non validée | Juridique | Relecture client obligatoire avant publication |
| Qualification HDS non tranchée | Choix d'hébergeur | Décision en phase 3 avec DPO |
| Spam / abus du formulaire | Image, boîte mail | Honeypot, rate limit, Turnstile/hCaptcha |
| Fuite de données demandeurs | RGPD | Chiffrement disque, accès restreint, purge, journalisation |
| Dépendance à un prestataire | Coût/pérennité | Docker portable, sauvegardes exportables |
| Client non technicien | Mauvaise exploitation | Admin simple + guides illustrés |
