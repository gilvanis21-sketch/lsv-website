# 08 — Guide utilisateur de l'administration (sans compétence technique)

Adresse : `https://votre-domaine/admin` · à utiliser sur ordinateur (le site public est adapté au mobile).

## Se connecter
1. Saisir votre e-mail et votre mot de passe. 2. Si la double authentification est activée : saisir le code à 6 chiffres de votre application (Google Authenticator, Aegis…). 3. Après 5 erreurs, le compte est bloqué 15 minutes : attendez, ou demandez à un administrateur de réinitialiser.
**Activer la double authentification (recommandé)** : *Mon compte / sécurité* → *Activer* → scanner le QR code → saisir le code. Changer son mot de passe : même page (12 caractères minimum).

## Les trois rôles
| Rôle | Peut faire |
|---|---|
| Administrateur | Tout, dont gérer les utilisateurs et lire le journal |
| Éditeur | Articles, catégories, services, paramètres du site |
| Secrétariat | Uniquement les demandes de rendez-vous |

## Traiter les demandes de rendez-vous (menu *Demandes*)
- Chaque demande reçue arrive en statut **Nouvelle** ; un e-mail d'alerte (sans coordonnées) est envoyé. La personne reçoit un e-mail précisant que c'est **une demande, pas une réservation**.
- Cliquer sur la référence (ex. `LSV-2026-A1B2C3`) → lire les coordonnées → contacter la personne → choisir le statut : **En attente** (en cours d'échange), **Confirmée** (créneau validé avec la personne), **Refusée**, **Traitée** (terminée). *Enregistrer.*
- *Notes internes* : pratiques uniquement (« rappeler jeudi »). **N'écrivez jamais d'informations médicales.**
- Recherche par référence ou nom ; filtre par statut.
- **Droits des personnes** : *Exporter les données* (droit d'accès) ; *Supprimer cette demande* (droit à l'effacement, case de confirmation). *Purger les demandes expirées* efface celles dont la durée de conservation est dépassée.

## Publier une actualité (menu *Articles*)
*Nouvel article* → titre, résumé, contenu (texte simple, **une ligne vide entre deux paragraphes**) → catégorie → image (JPEG/PNG/WebP, 3 Mo max, avec texte alternatif décrivant l'image) → statut **Brouillon** (invisible) ou **Publié** → date de publication (une date future **programme** la mise en ligne) → *Enregistrer*. Modifier ou supprimer : cliquer sur le titre dans la liste. Catégories : menu *Catégories*.

## Modifier les services (menu *Services*)
Titre, résumé, description, objectifs, déroulement, informations pratiques (une ligne par élément). **Tarif : laissez vide s'il n'est pas communiqué** — rien ne s'affiche alors. Décocher *Publié* masque le service ; *Nouveau service* en ajoute un (il apparaît tout seul sur le site).

## Coordonnées et horaires (menu *Paramètres du site*)
Téléphone, e-mail, adresse, horaires, accès, tarifs : ils s'affichent dans « Informations pratiques » et en bas de chaque page. Laissez vide ce qui n'est pas validé.

## Gérer l'équipe (administrateur — menu *Utilisateurs*)
Créer un compte (rôle + mot de passe initial à transmettre de façon sécurisée), changer un rôle, désactiver un compte (départ d'une personne : **le faire le jour même**), réinitialiser un mot de passe ou la double authentification. Vous ne pouvez pas modifier votre propre rôle, ni retirer le dernier administrateur.

## Bonnes pratiques
Un compte par personne, jamais partagé · mots de passe uniques · se déconnecter sur un poste partagé · ne jamais transmettre de coordonnées de demandeurs par e-mail non sécurisé · en cas de doute (mail suspect, compte inconnu dans la liste) : prévenir l'administrateur et consulter le *Journal*.

## En cas de problème
Voir `09-exploitation.md` §7, ou contacter le prestataire de maintenance.
