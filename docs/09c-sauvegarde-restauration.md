# 09c — Sauvegarde et restauration

## Principe
- **Quoi** : base PostgreSQL (demandes, comptes, articles, services, paramètres, journal) + images téléversées.
- **Quand** : tous les jours à 02:30 (`BACKUP_CRON`). **Conservation** : 30 jours sur le serveur (`BACKUP_RETENTION_DAYS`).
- **Chiffrement** : [age](https://age-encryption.org). Le serveur ne détient que la **clé publique** (`BACKUP_AGE_RECIPIENT`) : un attaquant qui prend le serveur ne peut pas lire les sauvegardes.
- **Hors site** : obligatoire (un serveur ne se sauvegarde pas lui-même). Renseigner `BACKUP_OFFSITE_CMD` (ex. `rclone copy /backups remote:lsv-sauvegardes`). La sauvegarde échoue (et le journal le signale) si la copie échoue.

## Générer la paire de clés (une fois, sur un poste de LSV — pas sur le serveur)
```
docker run --rm --entrypoint age-keygen lsv-backup:local      # ou : age-keygen -o cle-privee-lsv.txt
```
- La ligne `# public key: age1…` va dans `BACKUP_AGE_RECIPIENT`.
- La **clé privée** (`AGE-SECRET-KEY-…`) est conservée par LSV à **deux endroits hors serveur** (gestionnaire de mots de passe + coffre/clé USB). **Sans elle, aucune restauration n'est possible.**

## Vérifier que ça fonctionne
`./ops/dc ps` → le service `backup` est « healthy » (une sauvegarde de moins de 26 h existe). Lancer à la main : `./ops/dc exec backup /usr/local/bin/backup.sh`. Lister : `./ops/dc exec backup ls -lh /backups`.

## Restaurer — toujours d'abord vers une base de test
```
./ops/restore.sh db-20261103-191819.dump.age /chemin/absolu/cle-privee-lsv.txt
```
Crée la base `lsv_restore_test` (la production n'est pas touchée). Contrôler les données :
```
./ops/dc exec db psql -U lsv -d lsv_restore_test -c "select count(*) from appointment_requests"
```
puis la supprimer : `./ops/dc exec db psql -U lsv -d postgres -c "DROP DATABASE lsv_restore_test"`.

## Restaurer en PRODUCTION (sinistre) — avec accord écrit
1. `./ops/dc stop app` (le site s'arrête).
2. Sauvegarde de l'état actuel si la base répond encore (`backup.sh`).
3. `./ops/restore.sh <fichier> <clé> lsv` — le script exige de taper `OUI`.
4. `./ops/dc start app` ; vérifier `/api/health`, la connexion admin, le nombre de demandes.
5. Images : `age -d -i cle.txt uploads-….tar.age | tar -x -C <volume uploads>` (via `./ops/dc run --rm --no-deps --entrypoint sh -v cle:/key.txt:ro backup`).

## Test de restauration (réalisé le 2026-11-03, voir PV 13)
Sauvegarde chiffrée → restauration vers base de test → comptage des tables (demandes, comptes, services, journal) et référence d'une demande **identiques** à la production ; **mauvaise clé refusée** (`no identity matched`) ; archive d'images déchiffrée et lisible. À refaire **chaque mois** et après tout changement d'hébergeur.

## Urgence : perte de toutes les 2FA / de tous les mots de passe admin
Sur le serveur : `./ops/dc exec db psql -U lsv -d lsv -c "update users set totp_enabled=false, totp_secret=null where email='admin@…'"` puis se connecter avec le mot de passe, ou créer un nouvel admin via le profil `bootstrap` avec de nouvelles variables `SEED_ADMIN_*` (puis les retirer). À journaliser et à signaler au client.
