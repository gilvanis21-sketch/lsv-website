FROM postgres:16-alpine
RUN apk add --no-cache restic tzdata
COPY backup.sh /usr/local/bin/backup.sh
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/*.sh
# Sain si une sauvegarde complète a réussi dans les dernières 26 h (marqueur écrit par backup.sh).
HEALTHCHECK --interval=1h --timeout=5s CMD test -n "$(find /backups/.last-ok -mmin -1560 2>/dev/null)" || exit 1
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
