# 🐳 Docker Quick Reference - Node.js/TypeScript

## 📋 Checklist de Implementación

### ✅ Preparación del Proyecto
- [ ] Estructura de carpetas organizada
- [ ] `package.json` con scripts correctos
- [ ] `tsconfig.json` optimizado para Docker
- [ ] Variables de entorno en `.env.example`
- [ ] `.gitignore` actualizado

### ✅ Archivos Docker
- [ ] `Dockerfile` con multi-stage build
- [ ] `Dockerfile.dev` para desarrollo
- [ ] `docker-compose.yml` configurado
- [ ] `.dockerignore` completo
- [ ] Scripts de despliegue

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
# Construir y ejecutar
docker-compose up --build

# Solo desarrollo
docker-compose --profile dev up --build

# Ver logs
docker-compose logs -f app

# Parar servicios
docker-compose down
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
```

### Testing
```bash
# Probar API (PowerShell)
(Invoke-WebRequest -Uri "http://localhost:3000/api/saludos").Content

# Probar con curl (Linux/Mac)
curl http://localhost:3000/api/saludos

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
MONGODB_URI=mongodb://localhost:27017/dev

# Producción
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
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
      - NODE_ENV=production
    restart: unless-stopped
```

### Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
```

---

## 🚨 Troubleshooting Rápido

### Problema: Puerto en uso
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"
```

### Problema: Error de módulos
```bash
# Reconstruir sin cache
docker-compose build --no-cache
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
    uptime: process.uptime()
  });
});
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
curl -f http://localhost:3000/api/health
```

---

## 📚 Recursos

### Documentación
- [Docker Docs](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js Docker](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

### Herramientas
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Portainer](https://www.portainer.io/)
- [Trivy](https://trivy.dev/)

### Mejores Prácticas
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) 