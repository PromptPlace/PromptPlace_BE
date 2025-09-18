# ========= 1) base: 공통 =========
FROM node:20-alpine AS base
WORKDIR /app
# Prisma/Alpine 의존성 + 헬스체크용 curl
RUN apk add --no-cache openssl libc6-compat curl
# pnpm 활성화
RUN corepack enable && corepack prepare pnpm@9 --activate

# ========= 2) deps: 의존성 설치(캐시 최적화) =========
FROM base AS deps
# lockfile/manifest + prisma 스키마만 먼저 복사 → 캐시 최대화
COPY pnpm-lock.yaml package.json ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# ========= 3) builder: TS 빌드 + Prisma Client 생성 =========
FROM deps AS builder
COPY tsconfig.json ./
COPY src ./src
# Prisma Client (Alpine용) 생성
RUN pnpm prisma generate
# TS -> JS (dist/)
RUN pnpm build

# ========= 4) runner: 런타임 슬림 이미지 =========
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

# 앱 메타/락파일
COPY package.json pnpm-lock.yaml ./
# node_modules / dist / prisma 복사
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# devDependencies 제거로 슬림화
RUN pnpm prune --prod

# pnpm dlx 캐시 경로를 /tmp로 지정 (권한 문제 방지)
ENV XDG_CACHE_HOME=/tmp/.cache
RUN mkdir -p /tmp/.cache && chmod -R 777 /tmp/.cache


# 비루트 유저로 실행
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs
USER nodeuser

EXPOSE 3000

# compose에서 command로 덮어쓰는 경우 fallback
CMD ["node", "dist/index.js"]
