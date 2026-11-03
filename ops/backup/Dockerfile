FROM postgres:16-alpine
RUN apk add --no-cache age tzdata
COPY backup.sh /usr/local/bin/backup.sh
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/*.sh
HEALTHCHECK --interval=1h --timeout=5s CMD test -n "$(find /backups -name 'db-*.age' -mmin -1560 2>/dev/null | head -1)" || exit 1
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
