# syntax=docker/dockerfile:1
# Image de production du site LSV (Next.js « standalone », utilisateur non-root).
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Outils d'exploitation : migrations et initialisation (one-shot, jamais exposé).
FROM build AS tools
ENV NODE_ENV=production
CMD ["npm", "run", "db:migrate"]

FROM node:22-alpine AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000 UPLOAD_DIR=/data/uploads
RUN addgroup -S app && adduser -S app -G app && mkdir -p /data/uploads /app/.next/cache && chown -R app:app /data /app
WORKDIR /app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
