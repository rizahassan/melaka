# Melaka Listener Service - Monorepo Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/cloud/package.json ./packages/cloud/
COPY services/listener/package.json ./services/listener/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/core/ ./packages/core/
COPY packages/cloud/ ./packages/cloud/
COPY services/listener/ ./services/listener/

# Build packages and service
RUN pnpm --filter @melaka/core build
RUN pnpm --filter @melaka/cloud build
RUN pnpm --filter melaka-listener build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built packages and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/packages/cloud/dist ./packages/cloud/dist
COPY --from=builder /app/packages/cloud/package.json ./packages/cloud/
COPY --from=builder /app/services/listener/dist ./services/listener/dist
COPY --from=builder /app/services/listener/package.json ./services/listener/
COPY --from=builder /app/services/listener/node_modules ./services/listener/node_modules

WORKDIR /app/services/listener

EXPOSE 8080

CMD ["node", "dist/index.js"]
