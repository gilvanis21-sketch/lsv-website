# 03 — Comparatif d'architectures et matrice de décision

Les coûts sont des **ordres de grandeur à vérifier** avec les tarifs en vigueur avant engagement.

## Les trois options

### A — Constructeur de site (Wix / Squarespace / Webflow)
- ➕ Mise en route très rapide, maintenance quasi nulle, pas de serveur à gérer.
- ➖ Back-office de demandes de RDV, rôles fins, purge RGPD, journal d'audit : très limités ou bricolés par plugins. Données chez un tiers souvent hors UE. Forte dépendance, export difficile.
- Coût initial : bas. Mensuel : ~15-50 €.

### B — Full Stack Next.js + PostgreSQL, conteneurisé (Docker) sur un VPS UE
- ➕ Contrôle total des données (RGPD), admin et rôles sur mesure, très bonnes performances/SEO (pages pré-rendues), portable, sécurité maîtrisable, pas de verrou fournisseur.
- ➖ Coût initial de développement le plus élevé, nécessite des mises à jour de sécurité régulières (mitigées par Docker + procédures + contrat de maintenance).
- Coût initial : élevé. Mensuel : ~10-30 € (VPS UE + sauvegardes + SMTP + monitoring).

### C — WordPress auto-hébergé (hébergeur UE) + plugins
- ➕ Écosystème connu, édition simple du contenu, coût initial modéré.
- ➖ Plugins = surface d'attaque et mises à jour constantes ; modèle de rôles et statuts de demandes à bricoler ; RGPD/purge dépend de plugins tiers ; performance à surveiller.
- Coût initial : moyen. Mensuel : ~10-40 €.

## Matrice de décision pondérée

Notes de 1 (mauvais) à 5 (excellent) ; pour les critères « coût » et « complexité », 5 = le plus favorable.

| Critère | Poids | A Constructeur | B Next.js + PG | C WordPress |
|---------|------:|:---:|:---:|:---:|
| Coût initial | 10 | 5 | 2 | 4 |
| Coût mensuel | 10 | 4 | 3 | 4 |
| Sécurité | 15 | 4 | 4 | 2 |
| Performances | 8 | 3 | 5 | 3 |
| Facilité de maintenance | 15 | 5 | 3 | 4 |
| Scalabilité | 5 | 2 | 5 | 3 |
| Complexité technique (5 = simple) | 10 | 5 | 2 | 4 |
| Faible dépendance fournisseur | 7 | 1 | 4 | 3 |
| Maîtrise RGPD / données | 12 | 2 | 5 | 3 |
| Adéquation fonctionnelle (demandes, rôles, blog) | 8 | 1 | 5 | 3 |
| **Total pondéré / 500** | 100 | **348** | **368** | **330** |
| **Score /5** | | 3,48 | **3,68** | 3,30 |

## Recommandation : option B, avec garde-fous de maintenabilité

Écart faible (368 vs 348) : le choix tient au **besoin fonctionnel et RGPD** (gestion de demandes contenant des données personnelles, rôles, purge, hébergement UE), que A couvre mal. Si le client privilégie avant tout un coût minimal et une maintenance zéro, et accepte un back-office limité, **A reste défendable** (si la maintenance pèse 25 au lieu de 15, A et B s'égalisent).

Pour garder B simple à maintenir :
- Un seul conteneur applicatif + PostgreSQL, derrière Caddy (HTTPS automatique).
- Un seul VPS UE détenu par LSV ; sauvegardes chiffrées quotidiennes hors serveur ; restauration scriptée.
- Mises à jour des dépendances automatisées (Renovate/Dependabot) et guide d'exploitation pas à pas.
- Admin pensé pour non-techniciens.

Variante d'hébergement à trancher en phase 3 : VPS Docker (souveraineté, ~10-20 €/mois) **ou** PaaS UE géré (moins d'administration, plus cher). La question HDS (voir 01) peut imposer un hébergeur certifié.

**Décision finale : à valider par le client.**

---
**Décision client (2026-11-03) : option B validée** (Next.js + PostgreSQL, Docker). Restent à trancher : direction artistique, budget mensuel, hébergeur (VPS vs PaaS UE) et question HDS.
