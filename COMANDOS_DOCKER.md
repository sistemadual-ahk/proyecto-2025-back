# 🐳 Comandos Docker - proyecto-2025-back

## 🚀 Comandos Básicos

### Encender servicios
```bash
# Despliegue completo
docker-compose up --build -d

# Solo desarrollo
docker-compose --profile dev up --build
```

### Verificar estado
```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f app

# Ver logs específicos
docker-compose logs app --tail=100
```

### Gestión de servicios
```bash
# Parar servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

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
```

### Testing
```bash
# Probar API (PowerShell)
.\test-api.ps1

# Probar endpoint GET
(Invoke-WebRequest -Uri "http://localhost:3000/api/saludos").Content

# Probar endpoint POST
(Invoke-WebRequest -Uri "http://localhost:3000/api/saludos/saludar" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"nombre":"Juan"}').Content
```

## 🧹 Mantenimiento

### Limpieza
```bash
# Limpiar recursos no utilizados
docker system prune -a

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
docker-compose logs -f

# Ver últimas 50 líneas
docker-compose logs --tail=50
```

### Recursos
```bash
# Ver estadísticas de contenedores
docker stats

# Ver información detallada
docker inspect proyecto-2025-back-app-1

# Ver procesos dentro del contenedor
docker-compose exec app ps aux
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
curl -f http://localhost:3000/api/health || exit 1

echo "✅ Despliegue completado!"
```

## 📋 Checklist de Comandos

### Para desarrollo diario:
- [ ] `docker-compose up --build -d` - Encender servicios
- [ ] `docker-compose logs -f app` - Ver logs
- [ ] `.\test-api.ps1` - Probar API
- [ ] `docker-compose down` - Parar servicios

### Para debugging:
- [ ] `docker-compose exec app sh` - Entrar al contenedor
- [ ] `docker-compose logs app --tail=100` - Ver logs recientes
- [ ] `docker stats` - Ver uso de recursos
- [ ] `docker inspect proyecto-2025-back-app-1` - Ver información detallada

### Para mantenimiento:
- [ ] `docker system prune -a` - Limpiar recursos
- [ ] `docker-compose build --no-cache` - Reconstruir
- [ ] `docker system df` - Ver espacio en disco
- [ ] `docker scan proyecto-2025-back` - Escanear vulnerabilidades 