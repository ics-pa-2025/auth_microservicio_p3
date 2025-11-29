# =========================
# Etapa 1: Build
# =========================
FROM node:20 AS build-stage

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (con lockfile si existe para mayor reproducibilidad)
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación (Nest compila a JS en /dist)
RUN npm run build

# =========================
# Etapa 2: Producción
# =========================
FROM node:20-alpine AS production-stage

# Establecer directorio de trabajo
WORKDIR /app

# Copiar solo package.json + lockfile
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar los archivos compilados desde la etapa anterior
COPY --from=build-stage /app/dist ./dist

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Exponer el puerto (Nest usa 3000 por defecto, Azure respeta PORT si está seteado)
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main.js"]
