# ---- Stage 1: Builder ----
FROM node:22-slim AS builder

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/webgl-image/package.json packages/webgl-image/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build:deps
RUN NODE_OPTIONS="--max-old-space-size=8192" pnpm build

# ---- Stage 2: Production ----
FROM node:22-slim AS production

RUN apt-get update && apt-get install -y perl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.34.1 --activate

WORKDIR /app

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/server/database/migrations ./server/database/migrations
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=builder /app/packages/webgl-image/package.json ./packages/webgl-image/
COPY --from=builder /app/packages/webgl-image/dist ./packages/webgl-image/dist
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
