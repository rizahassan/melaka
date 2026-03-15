# Melaka Worker Service - Standalone Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY services/worker/package.json ./
COPY services/worker/tsconfig.json ./
COPY services/worker/src ./src

# Install dependencies and build
RUN npm install
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files and production deps
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
RUN npm install --omit=dev

EXPOSE 8080

CMD ["node", "dist/index.js"]
