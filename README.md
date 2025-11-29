# Auth Service 🔐

Microservicio de autenticación desarrollado con NestJS y MySQL.

## 🚀 Ejecutar con Docker Compose

### Prerequisitos

- Docker y Docker Compose instalados

### Pasos:

1. **Crear archivo de configuración**

```bash
cp .env.dist .env
```

2. **Configurar variables en .env**
   Editar el archivo `.env` con las variables detalladas en `.env.dist`

3. **Ejecutar**

```bash
docker compose up -d
```

**✅ Servicio disponible en:** `http://localhost:3001`

## 📋 Variables de entorno requeridas

Revisar `.env.dist` para las variables necesarias:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`: Configuración de MySQL
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: Claves para JWT
- `FRONTEND_URL_DEV`, `FRONTEND_URL_PROD`: URLs permitidas para CORS

## 🔧 Comandos útiles

```bash
# Parar servicios
docker compose down

# Ver logs
docker compose logs auth
```
