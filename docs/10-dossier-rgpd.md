# 10 — Dossier RGPD

> **Avertissement** : document de travail préparé par l'équipe technique. Il n'est **pas un avis juridique**. Il doit être relu et validé par le responsable du traitement (LSV) et, si possible, un juriste ou DPO avant mise en ligne. Les éléments `[À CONFIRMER]` sont des valeurs provisoires.

## 1. Responsable du traitement
Laboratoire Scientifique de la Voix — représentant : M. Fadi Dahdouh. Forme juridique, SIRET, adresse, contact RGPD : `[À CONFIRMER]`. DPO : `[À CONFIRMER : obligatoire ou non à évaluer]`.

## 2. Registre des traitements (projet)
| # | Traitement | Finalité | Données | Base légale (à valider) | Destinataires | Conservation |
|---|---|---|---|---|---|---|
| T1 | Demandes de rendez-vous | Traiter la demande, recontacter, confirmer un créneau | Nom, prénom, e-mail, téléphone, type de demande, créneau souhaité, date/version du consentement, statut, notes internes | Mesures précontractuelles prises à la demande de la personne (art. 6.1.b) ; à confirmer par un juriste | Personnel habilité du LSV ; hébergeur et prestataire e-mail (sous-traitants) | **12 mois** après la demande `[À CONFIRMER]`, puis suppression automatique (`purge_at`) |
| T2 | Comptes d'administration | Accès sécurisé au back-office | Nom, e-mail pro, rôle, mot de passe haché (Argon2id), secret 2FA chiffré | Intérêt légitime (sécurité) / exécution du contrat de travail | Administrateurs | Durée de l'activité du compte ; suppression au départ |
| T3 | Journal d'audit & journaux techniques | Sécurité, traçabilité | Action, acteur, **IP pseudonymisée (HMAC)**, date ; journaux d'accès du serveur | Intérêt légitime (art. 6.1.f) | Administrateurs ; hébergeur | Journal d'audit : `[À CONFIRMER, ex. 12 mois]` ; journaux Docker : 5 × 10 Mo (rotation) |
| T4 | Sauvegardes | Continuité / reprise | Copie chiffrée de T1–T3 | Intérêt légitime | LSV (détenteur de la clé) ; stockage hors site | 30 jours `[À CONFIRMER]` — **attention** : une personne supprimée reste dans les sauvegardes jusqu'à leur expiration (à indiquer dans la politique) |
| T5 | Site public | Information | **Aucun cookie, aucun traceur, aucune statistique** | — | — | — |

## 3. Principes appliqués
- **Minimisation** : le formulaire ne demande **aucun motif médical** ni détail de santé ; l'avertissement « n'indiquez aucune information médicale » est affiché ; les notes internes le rappellent ; l'e-mail à l'administrateur ne contient **pas** de coordonnées (référence uniquement).
- **Transparence** : le consentement renvoie à la politique de confidentialité (à rédiger/valider) ; l'e-mail de confirmation rappelle l'usage des données et la procédure de droits.
- **Consentement** : la case du formulaire sert d'information et de preuve (horodatage + version `2026-11-v1`) ; elle n'est **pas** présentée comme base légale universelle. Aucun traitement n'exige de consentement cookies puisqu'**aucun traceur non essentiel** n'est déposé. Le consentement sera à gérer si le client ajoute plus tard des statistiques, une carte, une vidéo, un CAPTCHA tiers ou une newsletter.
- **Limitation de la conservation** : date de purge enregistrée dès la création ; purge manuelle (bouton) ou planifiée (`db:purge`, voir 09 §6).
- **Sécurité** : voir dossier 11 (chiffrement TLS, hachage, chiffrement des sauvegardes et des secrets 2FA, contrôle d'accès par rôles, journal).
- **Hébergement dans l'UE** : à respecter dans le choix de l'hébergeur et du prestataire SMTP ; vérifier les transferts hors UE `[À CONFIRMER]`.

## 4. Droits des personnes
| Droit | Mise en œuvre |
|---|---|
| Accès / portabilité | Admin → fiche de la demande → *Exporter les données* (JSON) |
| Rectification | Modification en base par un administrateur sur demande (à ajouter à l'interface si le volume le justifie) |
| Effacement | Admin → *Supprimer cette demande* (journalisé) ; rappel : les sauvegardes expirent sous 30 jours |
| Opposition / limitation | Passer la demande en statut *Traitée* et ne plus la traiter ; suppression sur demande |
| Identification de la demande | La personne indique sa **référence** `LSV-AAAA-XXXXXX` (présente dans l'e-mail reçu) |
Délai de réponse légal : 1 mois. Procédure interne et modèle de réponse : `[À CONFIRMER par LSV]`.

## 5. Violation de données
En cas de perte, vol ou accès non autorisé : isoler (désactiver les comptes, changer les secrets), consulter le **Journal**, **notifier la CNIL sous 72 h** si risque pour les personnes, informer les personnes si risque élevé, consigner dans un registre des violations.

## 6. Points ouverts (décisions à prendre par LSV)
1. **Données de santé / hébergement HDS** : une demande « suivi » avec nom et coordonnées peut révéler un lien patient–praticien. **Avis juridique requis** avant production : si un hébergement certifié HDS est exigé, l'hébergeur et le coût changent (voir 12).
2. Durées de conservation T1, T3, T4.
3. Analyse d'impact (AIPD) : à évaluer par le DPO/juriste (volume faible, mais catégorie sensible possible).
4. Rédaction finale : mentions légales, politique de confidentialité, clause sous-traitants (hébergeur, SMTP), registre officiel.
5. Fournisseur SMTP : contrat de sous-traitance (art. 28) et localisation UE.
