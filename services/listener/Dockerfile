# Melaka Cloud Listener Service
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/cloud ./packages/cloud
COPY packages/ai ./packages/ai
COPY packages/core ./packages/core

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build packages
RUN pnpm --filter @melaka/core build
RUN pnpm --filter @melaka/ai build
RUN pnpm --filter @melaka/cloud build

# Production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/cloud/dist ./packages/cloud/dist
COPY --from=builder /app/packages/cloud/package.json ./packages/cloud/
COPY --from=builder /app/packages/ai/dist ./packages/ai/dist
COPY --from=builder /app/packages/ai/package.json ./packages/ai/
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/

# Copy listener service
COPY services/listener ./services/listener

WORKDIR /app/services/listener

RUN npm install

EXPOSE 8080

CMD ["node", "index.js"]
