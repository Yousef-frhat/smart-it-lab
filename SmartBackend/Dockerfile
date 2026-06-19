# ── Stage 1: Dependencies ────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# ── Stage 2: Production Image ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 expressjs

# Install dumb-init for proper signal handling (graceful shutdown)
RUN apk add --no-cache dumb-init curl

# Copy only production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=expressjs:nodejs . .

# Remove dev/utility files that should not be in production image
RUN rm -f src/database/seed.js src/database/audit-labs.js 2>/dev/null || true

USER expressjs

EXPOSE 5000

ENV NODE_ENV=production

# Health check so Docker/ECS knows when the container is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Use dumb-init to handle signals properly (enables graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
