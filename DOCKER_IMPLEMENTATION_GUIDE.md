# 🐳 Guía Completa de Implementación Docker para Aplicaciones Node.js/TypeScript

## 📋 Tabla de Contenidos

1. [Conceptos Fundamentales](#conceptos-fundamentales)
2. [Arquitectura de Docker](#arquitectura-de-docker)
3. [Implementación Paso a Paso](#implementación-paso-a-paso)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Optimización y Rendimiento](#optimización-y-rendimiento)
6. [Seguridad](#seguridad)
7. [Monitoreo y Logs](#monitoreo-y-logs)
8. [Troubleshooting](#troubleshooting)
9. [CI/CD con Docker](#cicd-con-docker)
10. [Despliegue en Producción](#despliegue-en-producción)

---

## 🎯 Conceptos Fundamentales

### ¿Qué es Docker?

Docker es una plataforma que permite empaquetar aplicaciones en **contenedores** que incluyen todo lo necesario para ejecutarse:
- Código de la aplicación
- Dependencias
- Configuración
- Entorno de ejecución

### Ventajas para Aplicaciones Node.js/TypeScript

1. **Consistencia**: Mismo comportamiento en todos los entornos
2. **Aislamiento**: No interfiere con otras aplicaciones
3. **Portabilidad**: Funciona en cualquier servidor con Docker
4. **Escalabilidad**: Fácil replicar y distribuir
5. **Seguridad**: Entorno controlado y aislado

---

## 🏗️ Arquitectura de Docker

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   App 1     │  │   App 2     │  │   App 3     │      │
│  │ (Container) │  │ (Container) │  │ (Container) │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                    Docker Engine                           │
├─────────────────────────────────────────────────────────────┤
│                    Operating System                        │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Stage Build (Optimización)

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
```

**Beneficios:**
- Imagen final más pequeña
- Solo incluye dependencias de producción
- Mejor seguridad (menos superficie de ataque)

---

## 🚀 Implementación Paso a Paso

### 1. Preparación del Proyecto

#### Estructura Recomendada
```
proyecto/
├── src/
│   ├── main/
│   │   ├── app.ts
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── services/
│   ├── config/
│   └── index.ts
├── Dockerfile
├── Dockerfile.dev
├── docker-compose.yml
├── .dockerignore
├── .env.example
└── package.json
```

#### Configuración de TypeScript
```json
{
  "compilerOptions": {
    "target": "es2021",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 2. Creación del Dockerfile

#### Dockerfile de Producción
```dockerfile
# Multi-stage build para optimizar el tamaño
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar todas las dependencias
RUN npm ci

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Imagen de producción
FROM node:18-alpine AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar archivos compilados
COPY --from=builder /app/dist ./dist

# Cambiar propietario de los archivos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para ejecutar la aplicación
CMD ["node", "dist/index.js"]
```

#### Dockerfile de Desarrollo
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar todas las dependencias
RUN npm install

# Copiar código fuente
COPY src/ ./src/

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=development
ENV PORT=3000

# Comando para ejecutar en modo desarrollo
CMD ["npm", "start"]
```

### 3. Configuración de Docker Compose

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
      - MONGODB_URI=mongodb+srv://ezequiel_escobar:kqnzhfDeCwRFnuMS@ahk.xh0jhbc.mongodb.net
      - MONGODB_PARAMS=retryWrites=true&w=majority&appName=AHK
      - MONGODB_DB_NAME=dummy
      - CORS_ORIGIN=http://localhost:3000
      - LOG_LEVEL=info
      - AUTH0_AUDIENCE=https://dev-zztnl4usqwhq2jl2.us.auth0.com/api/v2/
      - AUTH0_DOMAIN=dev-zztnl4usqwhq2jl2.us.auth0.com
    restart: unless-stopped
    networks:
      - app-network
    depends_on:
      - mongo
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=(admin)
      - MONGO_INITDB_ROOT_PASSWORD=(password123)
      - MONGO_INITDB_DATABASE=proyecto-2025
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped
    networks:
      - app-network

  # Servicio para desarrollo
  app-dev:
    build: 
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
      - MONGODB_URI=${MONGODB_URI}
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json
    depends_on:
      - mongo
    restart: unless-stopped
    networks:
      - app-network
    profiles:
      - dev

volumes:
  mongo_data:

networks:
  app-network:
    driver: bridge
```

### 4. Archivos de Configuración

#### .dockerignore
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
coverage
.nyc_output
.DS_Store
*.log
dist
build
.vscode
.idea
*.swp
*.swo
*~
```

#### .env.example
```env
# Configuración del servidor
PORT=3000
NODE_ENV=production

# Configuración de MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/db?retryWrites=true&w=majority

# Para MongoDB local en Docker
# MONGODB_URI=mongodb://admin:password123@mongo:27017/proyecto-2025?authSource=admin
```

---

## ✅ Mejores Prácticas

### 1. Optimización de Imágenes

#### Usar Alpine Linux
```dockerfile
FROM node:18-alpine  # ~170MB vs ~900MB de Ubuntu
```

#### Multi-stage Build
```dockerfile
# Build stage
FROM node:18-alpine AS builder
# ... build steps

# Production stage
FROM node:18-alpine AS production
# ... only production files
```

#### .dockerignore Completo
```
# Excluir archivos innecesarios
node_modules
.git
*.log
dist
coverage
```

### 2. Seguridad

#### Usuario No-Root
```dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

#### Variables de Entorno
```dockerfile
ENV NODE_ENV=production
ENV PORT=3000
```

#### Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
```

### 3. Gestión de Dependencias

#### package.json Optimizado
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "ts-node -r tsconfig-paths/register src/index.ts"
  },
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^8.16.4",
    "dotenv": "^17.2.0"
  },
  "devDependencies": {
    "typescript": "^5.0.4",
    "@types/express": "^5.0.3",
    "ts-node": "^10.9.1"
  }
}
```

### 4. Configuración de TypeScript

#### tsconfig.json Optimizado
```json
{
  "compilerOptions": {
    "target": "es2021",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "declaration": false,
    "sourceMap": false,
    "removeComments": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

---

## ⚡ Optimización y Rendimiento

### 1. Optimización de Capas

#### Orden de Instrucciones
```dockerfile
# 1. Copiar archivos de dependencias (cambia menos)
COPY package*.json ./

# 2. Instalar dependencias
RUN npm ci

# 3. Copiar código fuente (cambia más)
COPY src/ ./src/

# 4. Compilar
RUN npm run build
```

#### Cache de Dependencias
```dockerfile
# Usar npm ci en lugar de npm install
RUN npm ci --only=production
```

### 2. Configuración de Node.js

#### Optimizaciones de Rendimiento
```dockerfile
# Variables de entorno para optimización
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"
```

### 3. Monitoreo de Recursos

#### Límites de Recursos
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## 🔒 Seguridad

### 1. Usuario No-Root
```dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

### 2. Variables de Entorno Seguras
```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
    env_file:
      - .env
```

### 3. Escaneo de Vulnerabilidades
```bash
# Escanear imagen en busca de vulnerabilidades
docker scan proyecto-2025-back

# Usar herramientas como Trivy
trivy image proyecto-2025-back
```

### 4. Secrets Management
```yaml
services:
  app:
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    file: ./secrets/api_key.txt
```

---

## 📊 Monitoreo y Logs

### 1. Configuración de Logs

#### Docker Compose con Logs
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### Logs Estructurados
```javascript
// En tu aplicación
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});
```

### 2. Health Checks

#### Endpoint de Health Check
```typescript
// src/main/routes/health.routes.ts
import express from "express";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
```

#### Configuración en Dockerfile
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
```

### 3. Métricas y Monitoreo

#### Prometheus Metrics
```javascript
const prometheus = require('prom-client');

const collectDefaultMetrics = prometheus.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
```

---

## 🔧 Troubleshooting

### 1. Problemas Comunes

#### Error: Cannot find module
```bash
# Solución: Verificar que todas las dependencias estén instaladas
RUN npm ci --only=production
```

#### Error: Port already in use
```bash
# Solución: Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Cambiar 3000 por 3001
```

#### Error: Permission denied
```bash
# Solución: Usar usuario no-root
RUN chown -R nodejs:nodejs /app
USER nodejs
```

### 2. Comandos de Debugging

#### Ver logs en tiempo real
```bash
docker-compose logs -f app
```

#### Entrar al contenedor
```bash
docker-compose exec app sh
```

#### Ver información del contenedor
```bash
docker inspect proyecto-2025-back-app-1
```

#### Ver uso de recursos
```bash
docker stats
```

### 3. Limpieza y Mantenimiento

#### Limpiar recursos no utilizados
```bash
docker system prune -a
```

#### Reconstruir sin cache
```bash
docker-compose build --no-cache
```

#### Verificar espacio en disco
```bash
docker system df
```

---

## 🔄 CI/CD con Docker

### 1. GitHub Actions

#### .github/workflows/docker.yml
```yaml
name: Docker CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Build Docker image
      run: docker build -t proyecto-2025-back .
    
    - name: Run tests
      run: docker run --rm proyecto-2025-back npm test
    
    - name: Push to registry
      if: github.ref == 'refs/heads/main'
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker tag proyecto-2025-back ${{ secrets.DOCKER_USERNAME }}/proyecto-2025-back:latest
        docker push ${{ secrets.DOCKER_USERNAME }}/proyecto-2025-back:latest
```

### 2. Despliegue Automatizado

#### Script de Despliegue
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando despliegue..."

# Parar contenedores existentes
docker-compose down

# Construir nueva imagen
docker-compose build --no-cache

# Levantar servicios
docker-compose up -d

# Verificar health check
sleep 30
curl -f http://localhost:3000/api/health || exit 1

echo "✅ Despliegue completado!"
```

---

## 🚀 Despliegue en Producción

### 1. Preparación del Servidor

#### Instalar Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# CentOS/RHEL
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io
```

#### Instalar Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configuración de Producción

#### Variables de Entorno de Producción
```env
# .env.production
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/db?retryWrites=true&w=majority
LOG_LEVEL=info
```

#### Docker Compose de Producción
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### 3. Nginx como Reverse Proxy

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 4. SSL/TLS

#### Certbot con Docker
```yaml
services:
  certbot:
    image: certbot/certbot
    volumes:
      - ./ssl:/etc/letsencrypt
      - ./webroot:/var/www/html
    command: certonly --webroot --webroot-path=/var/www/html --email your-email@domain.com --agree-tos --no-eff-email -d your-domain.com
```

### 5. Backup y Recuperación

#### Script de Backup
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"

# Backup de volúmenes
docker run --rm -v proyecto-2025-back_mongo_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/mongo_$DATE.tar.gz -C /data .

# Backup de configuración
tar czf $BACKUP_DIR/config_$DATE.tar.gz docker-compose.yml .env

echo "Backup completado: $DATE"
```

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Official Images](https://hub.docker.com/_/node)

### Herramientas Útiles
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Docker Hub](https://hub.docker.com/)
- [Portainer](https://www.portainer.io/) - Gestión visual de Docker
- [Trivy](https://trivy.dev/) - Escaneo de vulnerabilidades

### Mejores Prácticas
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

## 🎯 Conclusión

La dockerización de aplicaciones Node.js/TypeScript ofrece múltiples beneficios:

1. **Consistencia**: Mismo comportamiento en todos los entornos
2. **Escalabilidad**: Fácil replicar y distribuir
3. **Seguridad**: Entorno aislado y controlado
4. **Portabilidad**: Funciona en cualquier servidor con Docker
5. **Mantenibilidad**: Fácil actualización y gestión

Siguiendo esta guía, podrás implementar Docker de manera profesional y aprovechar todas sus ventajas para el desarrollo y despliegue de aplicaciones. 