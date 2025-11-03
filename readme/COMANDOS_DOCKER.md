# 🐳 Comandos Docker - proyecto-2025-back

## 🚀 Comandos Básicos

### Testing Automatizado (Recomendado)
```bash
# Windows (PowerShell)
.\test-api.ps1

# Linux/Mac
chmod +x test-docker.sh
./test-docker.sh
```

### Encender servicios
```bash
# Despliegue completo con logs en tiempo real
docker-compose up --build

# Despliegue completo en segundo plano
docker-compose up --build -d

# Solo ejecutar (si no hay cambios en dependencias)
docker-compose up

# Solo desarrollo
docker-compose --profile dev up --build
```

### Verificar estado
```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f app

# Ver logs con timestamps
docker-compose logs -f --timestamps app

# Ver logs específicos
docker-compose logs app --tail=100
```

### Gestión de servicios
```bash
# Parar servicios
docker-compose down

# Reiniciar servicios
docker-compose restart app

# Reconstruir sin cache
docker-compose build --no-cache
```

## 🔧 Comandos de Desarrollo

### Debugging
```bash
# Entrar al contenedor
docker-compose exec app sh

# Ver información del contenedor
docker inspect proyecto-2025-back-app-1

# Ver uso de recursos
docker stats

# Ver configuración de docker-compose
docker-compose config
```

### Testing de API
```bash
# Testing completo (Windows)
.\test-api.ps1

# Testing completo (Linux/Mac)
./test-docker.sh

# Probar endpoint GET (PowerShell)
Invoke-RestMethod -Uri "http://localhost:3000/api/saludos" -Method GET

# Probar endpoint GET (curl)
curl http://localhost:3000/api/saludos

# Probar endpoint POST (PowerShell)
Invoke-RestMethod -Uri "http://localhost:3000/api/saludos/saludar" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"nombre":"Juan"}'

# Probar endpoint POST (curl)
curl -X POST http://localhost:3000/api/saludos/saludar \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan"}'

# Health check
curl -f http://localhost:3000/api/saludos
```

### Verificación de Estado
```bash
# Verificar logs de inicio
docker-compose logs app | grep "✅"

# Verificar conexión a MongoDB
docker-compose logs app | grep "MongoDB"

# Verificar que tsconfig-paths se registró
docker-compose logs app | grep "tsconfig-paths registrado"
```

## 🧹 Mantenimiento

### Limpieza
```bash
# Limpiar recursos no utilizados
docker system prune -a

# Limpiar contenedores detenidos
docker container prune

# Verificar espacio en disco
docker system df

# Ver imágenes
docker images
```

### Backup y Restore
```bash
# Backup de volúmenes
docker run --rm -v proyecto-2025-back_mongo_data:/data -v $(pwd):/backup alpine tar czf /backup/mongo_backup.tar.gz -C /data .

# Restore de volúmenes
docker run --rm -v proyecto-2025-back_mongo_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongo_backup.tar.gz -C /data
```

## 📊 Monitoreo

### Logs
```bash
# Ver todos los logs
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs app

# Ver logs en tiempo real
docker-compose logs -f app

# Ver últimas 50 líneas
docker-compose logs app --tail=50

# Ver logs con timestamps
docker-compose logs -f --timestamps app
```

### Recursos
```bash
# Ver estadísticas de contenedores
docker stats

# Ver información detallada
docker inspect proyecto-2025-back-app-1

# Ver procesos dentro del contenedor
docker-compose exec app ps aux

# Ver archivos dentro del contenedor
docker-compose exec app ls -la
```

## 🔒 Seguridad

### Escaneo
```bash
# Escanear imagen en busca de vulnerabilidades
docker scan proyecto-2025-back

# Verificar configuración de seguridad
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image proyecto-2025-back
```

## 🚨 Troubleshooting

### Problemas Comunes
```bash
# Puerto en uso
# Cambiar en docker-compose.yml:
ports:
  - "3001:3000"

# Error de módulos (@routes/routes)
# Verificar que tsconfig-paths-bootstrap.js esté copiado
docker-compose build --no-cache

# Error de compilación TypeScript
# Compilar localmente para ver errores
npm run build

# Error de permisos
# Usar usuario no-root en Dockerfile:
RUN chown -R nodejs:nodejs /app
USER nodejs

# Error de memoria
# Agregar límites en docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 1G
```

### Debugging Avanzado
```bash
# Ver logs de construcción
docker-compose build --progress=plain

# Ver variables de entorno del contenedor
docker-compose exec app env

# Ver archivos dentro del contenedor
docker-compose exec app ls -la

# Ver procesos del contenedor
docker-compose exec app top

# Verificar configuración
docker-compose config

# Reconstruir completamente
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up
```

## 🔄 CI/CD

### Despliegue Automatizado
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando despliegue..."

# Parar contenedores existentes
docker-compose down

# Limpiar cache
docker system prune -f

# Construir nueva imagen
docker-compose build --no-cache

# Levantar servicios
docker-compose up -d

# Esperar a que esté listo
sleep 30

# Verificar health check
curl -f http://localhost:3000/api/saludos || exit 1

echo "✅ Despliegue completado!"
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

## 📋 Checklist de Comandos

### Para desarrollo diario:
- [ ] `.\test-api.ps1` - Testing completo (Windows)
- [ ] `./test-docker.sh` - Testing completo (Linux/Mac)
- [ ] `docker-compose up --build` - Encender con logs en tiempo real
- [ ] `docker-compose up -d` - Encender en segundo plano
- [ ] `docker-compose logs -f app` - Ver logs
- [ ] `docker-compose down` - Parar servicios

### Para debugging:
- [ ] `docker-compose exec app sh` - Entrar al contenedor
- [ ] `docker-compose logs app --tail=100` - Ver logs recientes
- [ ] `docker stats` - Ver uso de recursos
- [ ] `docker inspect proyecto-2025-back-app-1` - Ver información detallada
- [ ] `docker-compose config` - Verificar configuración

### Para mantenimiento:
- [ ] `docker system prune -a` - Limpiar recursos
- [ ] `docker-compose build --no-cache` - Reconstruir
- [ ] `docker system df` - Ver espacio en disco
- [ ] `docker scan proyecto-2025-back` - Escanear vulnerabilidades

### Para testing:
- [ ] `.\test-api.ps1` - Testing completo en Windows
- [ ] `./test-docker.sh` - Testing completo en Linux/Mac
- [ ] `curl http://localhost:3000/api/saludos` - Probar API
- [ ] `docker-compose logs app | grep "✅"` - Verificar logs de éxito 