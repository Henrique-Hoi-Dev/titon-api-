# Multi-stage build para otimizar o tamanho da imagem
FROM node:20-alpine AS base

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Stage de dependências
FROM base AS deps
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json yarn.lock ./

# Instalar dependências de produção
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Stage de build
FROM base AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# Executar linting e testes (opcional para produção)
RUN yarn lint || true

# Stage de produção
FROM base AS runner
WORKDIR /app

# Configurar usuário não-root
USER nodejs

# Copiar dependências de produção
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código da aplicação
COPY --from=builder --chown=nodejs:nodejs /app ./

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV TZ=America/Sao_Paulo
ENV PORT=3000

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Usar dumb-init para melhor gerenciamento de sinais
ENTRYPOINT ["dumb-init", "--"]

# Comando de produção
CMD ["node", "server.js"]
