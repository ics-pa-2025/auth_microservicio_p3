# =========================
# Etapa 1: Build
# =========================
FROM node:20 AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# =========================
# Etapa 2: Producción
# =========================
FROM node:20-alpine AS production-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build-stage /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/main.js"]
