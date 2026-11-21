# syntax=docker/dockerfile:1.7
# ============================================================
# tech-blog 生产镜像（多阶段构建，自托管备选方案用）
# Vercel 部署不需要此文件。
# ============================================================

# ---------- 1. 依赖安装 ----------
FROM node:20-alpine AS deps
WORKDIR /app
# Prisma 需要访问 schema 才能生成 client
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# ---------- 2. 构建 ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 构建期需要 DATABASE_URL 让 prisma generate 通过（不连库）；
# BUILD_TARGET=docker 触发 next.config.js 里的 output: "standalone"
ENV DATABASE_URL="postgresql://build:***@localhost:5432/build" \
    BUILD_TARGET=docker \
    NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

# ---------- 3. 运行 ----------
FROM node:20-alpine AS runner
WORKDIR /app
# Prisma 引擎在 musl 上的依赖
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# 自托管上传目录需对运行用户可写（挂载卷首次初始化时继承此权限；放在 standalone 之后避免被覆盖）
RUN mkdir -p public/uploads && chown -R nextjs:nodejs public
# 迁移命令需要 schema 与 prisma 引擎
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000
# 容器内先跑迁移再起服务；失败即退出，便于编排层感知
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
