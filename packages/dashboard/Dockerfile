FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy workspace config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/dashboard/package.json ./packages/dashboard/
COPY packages/core/package.json ./packages/core/
COPY packages/cloud/package.json ./packages/cloud/

RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/dashboard/node_modules ./packages/dashboard/node_modules
COPY --from=deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=deps /app/packages/cloud/node_modules ./packages/cloud/node_modules
COPY . .

# Build dependencies first
RUN pnpm --filter @melaka/core build
RUN pnpm --filter @melaka/cloud build

# Build dashboard
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @melaka/dashboard build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/packages/dashboard/public ./packages/dashboard/public
COPY --from=builder --chown=nextjs:nodejs /app/packages/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/dashboard/.next/static ./packages/dashboard/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "packages/dashboard/server.js"]
