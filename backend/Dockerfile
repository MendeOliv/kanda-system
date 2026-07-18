# ==========================================
# DOCKERFILE - NestJS Backend (Production)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ curl

COPY package*.json .

# INSTALAR TODAS as dependências (incluindo devDeps) para compilar
RUN npm ci

COPY . .

# Gerar cliente Prisma antes do build
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# ==========================================
FROM node:20-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json .

# Apenas dependências de produção no stage final
RUN npm ci --only=production && npm cache clean --force

# Copiar cliente Prisma gerado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copiar build compilado
COPY --from=builder /app/dist ./dist

# Copiar schema Prisma (necessário em runtime para alguns casos)
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3001

# Health check no endpoint correcto
HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/main"]