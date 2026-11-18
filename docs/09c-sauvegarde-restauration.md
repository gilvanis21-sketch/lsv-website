# 09c — Sauvegarde et restauration (restic)

## Principe
- **Quoi** : base PostgreSQL (demandes, comptes, articles, services, paramètres, journal) + images téléversées.
- **Outil** : [restic](https://restic.net) — sauvegardes **chiffrées**, **dédupliquées** (seules les données modifiées sont retransmises) et vérifiables. Une « sauvegarde » est un *snapshot* ; la base est étiquetée `db`, les images `uploads`.
- **Quand** : tous les jours à 02:30 (`BACKUP_CRON`).
- **Conservation** : tout pendant 30 jours (`BACKUP_RETENTION_DAYS`), puis une sauvegarde par mois pendant 12 mois (`BACKUP_KEEP_MONTHLY`). Le nettoyage (`forget --prune`) est automatique.
- **Hors site** : le dépôt restic (`RESTIC_REPOSITORY`) doit être **hors du serveur** : S3 compatible (Scaleway, OVH, Wasabi…), Backblaze B2, ou un `rest-server`. Il n'y a plus de commande de copie séparée : restic écrit directement sur le stockage distant, et la sauvegarde **échoue** (signalée dans le journal, service « unhealthy ») si l'écriture échoue.
- **Intégrité** : `restic check` automatique le 1er de chaque mois.

## Configuration (`.env.production`)
```
RESTIC_REPOSITORY=s3:s3.fr-par.scw.cloud/lsv-sauvegardes     # ou b2:… / rest:…
RESTIC_PASSWORD=<openssl rand -base64 36>
AWS_ACCESS_KEY_ID=…        # identifiants du stockage (noms selon le fournisseur)
AWS_SECRET_ACCESS_KEY=…
```
Le dépôt est créé automatiquement à la première sauvegarde.

### ⚠ Le mot de passe restic
- `RESTIC_PASSWORD` chiffre toutes les sauvegardes. **Sans lui, aucune restauration n'est possible** : le conserver par LSV à **deux endroits hors serveur** (gestionnaire de mots de passe + coffre/clé USB), avec l'adresse du dépôt et les identifiants du stockage.
- Contrairement à l'ancien système (clé publique `age`), ce mot de passe est **présent sur le serveur** : un attaquant qui prend le serveur pourrait lire les sauvegardes et, selon les droits du stockage, les supprimer. Atténuation : créer pour le serveur des identifiants de stockage **en écriture seule / sans suppression** (ou *Object Lock* / versionnage S3, ou `rest-server --append-only`) ; le nettoyage de rétention se fait alors depuis un poste de confiance (`restic forget --prune`).

## Vérifier que ça fonctionne
- `./ops/dc ps` → le service `backup` est « healthy » (une sauvegarde complète a réussi il y a moins de 26 h).
- Lancer à la main : `./ops/dc exec backup /usr/local/bin/backup.sh`.
- Lister : `./ops/dc exec backup sh -c '. /etc/backup.env; restic snapshots'`.

## Restaurer — toujours d'abord vers une base de test
```
./ops/restore.sh latest                 # dernière sauvegarde (ou un identifiant de snapshot)
```
Crée la base `lsv_restore_test` (la production n'est pas touchée). Contrôler les données :
```
./ops/dc exec db psql -U lsv -d lsv_restore_test -c "select count(*) from appointment_requests"
```
puis la supprimer : `./ops/dc exec db psql -U lsv -d postgres -c "DROP DATABASE lsv_restore_test"`.

## Restaurer en PRODUCTION (sinistre) — avec accord écrit
1. `./ops/dc stop app` (le site s'arrête).
2. Sauvegarde de l'état actuel si la base répond encore (`backup.sh`).
3. `./ops/restore.sh <snapshot|latest> lsv` — le script exige de taper `OUI`.
4. `./ops/dc start app` ; vérifier `/api/health`, la connexion admin, le nombre de demandes.
5. Images : `./ops/dc run --rm --no-deps --entrypoint sh backup -c 'restic restore latest --tag uploads --target /restore --include /data/uploads'` avec le volume `uploads` monté sur `/restore` (ajouter `-v <volume_uploads>:/restore`), puis déplacer le contenu de `/restore/data/uploads` vers la racine du volume.

## Serveur perdu : restaurer sur une nouvelle machine
Il faut seulement les 3 éléments conservés par LSV : adresse du dépôt, identifiants du stockage, `RESTIC_PASSWORD`. Les renseigner dans un nouveau `.env.production`, démarrer `db` et `backup`, puis suivre la procédure ci-dessus.

## Test de restauration
Procédure à **refaire sur le serveur final** puis **chaque mois** et après tout changement d'hébergeur. Contrôler : comptage des tables (demandes, comptes, services, journal) identique à la production ; **mauvais mot de passe refusé** (`wrong password or no key found`). Le test local du 2026-11-18 (sauvegarde ×2, déduplication, rétention, dump lisible par `pg_restore`) est concluant ; l'ancien test du 2026-11-03 (PV 13) concernait le système `age`.

## Urgence : perte de toutes les 2FA / de tous les mots de passe admin
Sur le serveur : `./ops/dc exec db psql -U lsv -d lsv -c "update users set totp_enabled=false, totp_secret=null where email='admin@…'"` puis se connecter avec le mot de passe, ou créer un nouvel admin via le profil `bootstrap` avec de nouvelles variables `SEED_ADMIN_*` (puis les retirer). À journaliser et à signaler au client.
