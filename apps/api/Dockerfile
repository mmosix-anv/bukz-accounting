FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json packages/
COPY apps/api/package.json apps/api/
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @bukz/api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/db/dist ./node_modules/@bukz/db/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/emails/dist ./node_modules/@bukz/emails/dist

USER nestjs
EXPOSE 3001
CMD ["node", "dist/main.js"]