# 🐳 Guía de Dockerización y Despliegue

## 📋 Prerrequisitos

- Docker Desktop instalado
- Docker Compose instalado
- Git instalado

## 🚀 Despliegue Rápido

### Opción 1: Testing Automatizado (Recomendado para desarrollo)

```bash
# Windows (PowerShell)
.\test-api.ps1
```

### Opción 2: Despliegue manual

```bash
# Construir y levantar todos los servicios
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f app

# Parar servicios
docker-compose down
```

### Opción 3: Desarrollo con logs en tiempo real

```bash
# Ver logs mientras se ejecuta
docker-compose up --build

# Solo ejecutar (si no hay cambios en dependencias)
docker-compose up
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de MongoDB Atlas
MONGODB_URI=mongodb+srv://ezequiel_escobar:kqnzhfDeCwRFnuMS@ahk.xh0jhbc.mongodb.net
MONGODB_PARAMS=retryWrites=true&w=majority&appName=AHK
MONGODB_DB_NAME=main

# Configuración de CORS
CORS_ORIGIN=http://localhost:3000

# Configuración de logs
LOG_LEVEL=info

# Para auth0
AUTH0_AUDIENCE=https://dev-zztnl4usqwhq2jl2.us.auth0.com/api/v2/
AUTH0_DOMAIN=dev-zztnl4usqwhq2jl2.us.auth0.com

# Para MongoDB local en Docker (alternativa)
# MONGODB_URI=mongodb://admin:password123@mongo:27017/proyecto-2025?authSource=admin
```

## 🏗️ Estructura de Docker

### Dockerfile
- **Multi-stage build** para optimizar el tamaño
- **Alpine Linux** para menor tamaño de imagen
- **Usuario no-root** para seguridad
- **Compilación de TypeScript** incluida
- **tsconfig-paths-bootstrap.js** para resolución de alias

### Docker Compose
- **Servicio de aplicación** (Node.js/Express)
- **Variables de entorno** configuradas
- **Red personalizada** para comunicación entre servicios
- **Restart policy** configurado

## 🛠️ Comandos Útiles

### Testing y Desarrollo
```bash
# Testing completo (Windows)
.\test-api.ps1

# Desarrollo con hot reload
docker-compose --profile dev up --build

# Ver logs de desarrollo
docker-compose --profile dev logs -f app-dev
```

### Producción
```bash
# Construir imagen de producción
docker build -t proyecto-2025-back .

# Ejecutar contenedor de producción
docker run -p 3000:3000 --env-file .env proyecto-2025-back

# Ejecutar con docker-compose
docker-compose up --build -d
```

### Mantenimiento
```bash
# Ver logs
docker-compose logs -f app

# Ver logs con timestamps
docker-compose logs -f --timestamps app

# Entrar al contenedor
docker-compose exec app sh

# Reiniciar servicios
docker-compose restart app

# Limpiar recursos no utilizados
docker system prune -a

# Ver estado de servicios
docker-compose ps
```

### Testing de API
```bash
# Probar endpoint GET
curl http://localhost:3000/api/saludos

# Probar endpoint POST (PowerShell)
Invoke-RestMethod -Uri "http://localhost:3000/api/saludos/saludar" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"nombre":"Juan"}'

# Probar endpoint POST (curl)
curl -X POST http://localhost:3000/api/saludos/saludar \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan"}'
```

## 📊 Monitoreo

### Verificar estado de servicios
```bash
docker-compose ps
```

### Ver logs en tiempo real
```bash
docker-compose logs -f app
```

### Verificar que la aplicación funciona
```bash
# Verificar logs de inicio
docker-compose logs app | grep "✅"

# Verificar conexión a MongoDB
docker-compose logs app | grep "MongoDB"

# Probar la API
curl -f http://localhost:3000/api/saludos
```

## 🔒 Seguridad

- Usuario no-root en contenedores
- Variables de entorno para configuración
- Red aislada entre servicios
- tsconfig-paths-bootstrap.js para resolución segura de módulos

## 🚨 Troubleshooting

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

### Problema: La aplicación no se conecta a MongoDB
```bash
# Verificar variables de entorno
docker-compose config

# Ver logs de la aplicación
docker-compose logs app

# Verificar conectividad
docker-compose exec app ping ahk.xh0jhbc.mongodb.net
```

### Problema: Puerto ya en uso
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Cambiar 3000 por 3001
```

### Problema: Contenedor no inicia
```bash
# Ver logs detallados
docker-compose logs app

# Verificar configuración
docker-compose config

# Reconstruir completamente
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up
```

### Problema: Errores de compilación
```bash
# Limpiar cache de Docker
docker system prune -a

# Reconstruir sin cache
docker-compose build --no-cache

# Verificar que todos los archivos estén presentes
docker-compose exec app ls -la
```

## 📈 Escalabilidad

### Para producción con múltiples instancias:
```bash
# Escalar a 3 instancias
docker-compose up --scale app=3 -d
```

### Para usar con un load balancer:
- Configurar nginx como reverse proxy
- Usar Docker Swarm o Kubernetes para orquestación

## 🔄 CI/CD

### GitHub Actions (ejemplo)
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          docker-compose pull
          docker-compose up -d
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

## 📝 Notas Importantes

1. **Testing**: Usar `.\test-api.ps1` (Windows) para testing completo
2. **Variables de entorno**: Nunca committear archivos `.env` con credenciales
3. **Logs**: Los logs muestran el estado de tsconfig-paths y conexión a MongoDB
4. **Monitoreo**: Verificar logs con `docker-compose logs app | grep "✅"`
5. **SSL**: Configurar certificados SSL para producción
6. **Paths**: El proyecto usa alias de paths que se resuelven con `tsconfig-paths-bootstrap.js`

## 🆘 Soporte

Si encuentras problemas:
1. Revisar logs: `docker-compose logs app`
2. Verificar estado: `docker-compose ps`
3. Ejecutar testing: `.\test-api.ps1`
4. Reconstruir: `docker-compose build --no-cache`
5. Limpiar: `docker system prune -a` 