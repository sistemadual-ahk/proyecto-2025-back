# 🐳 Docker Quick Reference - Node.js/TypeScript

## 📋 Checklist de Implementación

### ✅ Preparación del Proyecto
- [ ] Estructura de carpetas organizada
- [ ] `package.json` con scripts correctos
- [ ] `tsconfig.json` optimizado para Docker
- [ ] Variables de entorno en `.env.example`
- [ ] `.gitignore` actualizado
- [ ] `tsconfig-paths-bootstrap.js` configurado

### ✅ Archivos Docker
- [ ] `Dockerfile` con multi-stage build
- [ ] `Dockerfile.dev` para desarrollo
- [ ] `docker-compose.yml` configurado
- [ ] `.dockerignore` completo
- [ ] Scripts de despliegue
- [ ] Scripts de testing (`test-api.ps1`)

### ✅ Seguridad
- [ ] Usuario no-root en Dockerfile
- [ ] Variables de entorno seguras
- [ ] Health checks implementados
- [ ] Logs configurados
- [ ] Secrets management (si aplica)

### ✅ Optimización
- [ ] Imagen Alpine Linux
- [ ] Multi-stage build
- [ ] Cache de dependencias
- [ ] Límites de recursos
- [ ] Logs rotados

---

## 🚀 Comandos Rápidos

### Desarrollo Local
```bash
# Construir y ejecutar (con logs en tiempo real)
docker-compose up --build

# Solo ejecutar (si no hay cambios en dependencias)
docker-compose up

# Solo desarrollo
docker-compose --profile dev up --build

# Ver logs
docker-compose logs -f app

# Parar servicios
docker-compose down
```

### Testing Automatizado
```bash
# Testing completo en Windows (PowerShell)
.\test-api.ps1

# Testing manual paso a paso
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
sleep 10
curl http://localhost:3000/api/saludos
```

### Producción
```bash
# Despliegue completo
docker-compose up --build -d

# Verificar estado
docker-compose ps

# Reiniciar servicios
docker-compose restart

# Ver logs de producción
docker-compose logs -f
```

### Debugging
```bash
# Entrar al contenedor
docker-compose exec app sh

# Ver información del contenedor
docker inspect proyecto-2025-back-app-1

# Ver uso de recursos
docker stats

# Ver logs específicos
docker-compose logs app --tail=100

# Ver logs con timestamps
docker-compose logs -f --timestamps app
```

### Mantenimiento
```bash
# Limpiar recursos no utilizados
docker system prune -a

# Reconstruir sin cache
docker-compose build --no-cache

# Verificar espacio en disco
docker system df

# Ver imágenes
docker images

# Limpiar contenedores detenidos
docker container prune
```

### Testing de API
```bash
# Probar API (PowerShell)
Invoke-RestMethod -Uri "http://localhost:3000/api/saludos" -Method GET

# Probar con curl (Linux/Mac)
curl http://localhost:3000/api/saludos

# Probar endpoint POST
curl -X POST http://localhost:3000/api/saludos/saludar \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan"}'

# Health check
curl -f http://localhost:3000/api/health
```

---

## 🔧 Configuraciones Comunes

### Variables de Entorno
```env
# Desarrollo
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://ezequiel_escobar:kqnzhfDeCwRFnuMS@ahk.xh0jhbc.mongodb.net
MONGODB_PARAMS=retryWrites=true&w=majority&appName=AHK
MONGODB_DB_NAME=main
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info

# Producción
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
CORS_ORIGIN=https://tu-app.onrender.com
```

### Docker Compose Básico
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
      - MONGODB_URI=mongodb+srv://...
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/saludos', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
```

---

## 🚨 Troubleshooting Rápido

### Problema: Puerto en uso
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"
```

### Problema: Error de módulos (@routes/routes)
```bash
# Verificar que tsconfig-paths-bootstrap.js esté copiado
# Reconstruir sin cache
docker-compose build --no-cache
```

### Problema: Error de compilación TypeScript
```bash
# Compilar localmente para ver errores
npm run build

# Verificar imports y tipos
npm run type-check
```

### Problema: Permisos
```bash
# Usar usuario no-root en Dockerfile
RUN chown -R nodejs:nodejs /app
USER nodejs
```

### Problema: Memoria insuficiente
```yaml
# Agregar límites en docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

### Problema: Contenedor no inicia
```bash
# Ver logs detallados
docker-compose logs app

# Verificar variables de entorno
docker-compose config

# Reconstruir completamente
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up
```

---

## 📊 Monitoreo

### Logs Estructurados
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

### Métricas Básicas
```javascript
// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### Verificación de Estado
```bash
# Verificar que la aplicación responde
curl -f http://localhost:3000/api/saludos

# Verificar logs de inicio
docker-compose logs app | grep "✅"

# Verificar conexión a MongoDB
docker-compose logs app | grep "MongoDB"
```

---

## 🔒 Seguridad

### Usuario No-Root
```dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

### Variables Seguras
```yaml
services:
  app:
    environment:
      - NODE_ENV=production
    env_file:
      - .env
```

### Escaneo de Vulnerabilidades
```bash
# Docker scan
docker scan proyecto-2025-back

# Trivy (si está instalado)
trivy image proyecto-2025-back
```

---

## ⚡ Optimización

### Multi-Stage Build
```dockerfile
# Build stage
FROM node:18-alpine AS builder
# ... build steps

# Production stage
FROM node:18-alpine AS production
# ... only production files
```

### Cache de Dependencias
```dockerfile
# Copiar package.json primero
COPY package*.json ./
RUN npm ci

# Luego copiar código
COPY src/ ./src/
```

### Límites de Recursos
```yaml
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

## 🔄 CI/CD

### GitHub Actions Básico
```yaml
name: Docker CI/CD
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - run: docker build -t app .
    - run: docker run --rm app npm test
```

### Despliegue Automatizado
```bash
#!/bin/bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
sleep 30
curl -f http://localhost:3000/api/saludos
```

### Script de Testing Automatizado
```bash
#!/bin/bash
echo "🐳 Iniciando pruebas de Docker..."

# Detener contenedores existentes
docker-compose down

# Limpiar imágenes
docker system prune -f

# Reconstruir imagen
docker-compose build --no-cache

# Iniciar servicios
docker-compose up -d

# Esperar que el servicio se inicie
sleep 10

# Verificar logs
docker-compose logs app

# Probar la API
curl -X GET http://localhost:3000/api/saludos

echo "✅ Pruebas completadas"
```

---

## 📚 Recursos

### Documentación
- [Docker Docs](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js Docker](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [tsconfig-paths](https://github.com/dividab/tsconfig-paths)

### Herramientas
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Portainer](https://www.portainer.io/)
- [Trivy](https://trivy.dev/)

### Mejores Prácticas
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) 