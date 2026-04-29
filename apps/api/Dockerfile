FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm --filter @open-chain-ai/api build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install Docker CLI for sandbox
RUN apk add --no-cache docker-cli

# Copy built app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/index.js"]
