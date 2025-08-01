# 🐳 Guía de Dockerización y Despliegue

## 📋 Prerrequisitos

- Docker Desktop instalado
- Docker Compose instalado
- Git instalado

## 🚀 Despliegue Rápido

### Opción 1: Usando el script de despliegue (Recomendado)

```bash
# Dar permisos de ejecución al script
chmod +x deploy.sh

# Ejecutar el despliegue
./deploy.sh
```

### Opción 2: Comandos manuales

```bash
# Construir y levantar todos los servicios
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f app

# Parar servicios
docker-compose down
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración del servidor
PORT=3000
NODE_ENV=production

# Configuración de MongoDB
MONGODB_URI=mongodb://admin:password123@mongo:27017/proyecto-2025?authSource=admin

# Para MongoDB Atlas (producción)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/proyecto-2025?retryWrites=true&w=majority
```

## 🏗️ Estructura de Docker

### Dockerfile
- **Multi-stage build** para optimizar el tamaño
- **Alpine Linux** para menor tamaño de imagen
- **Usuario no-root** para seguridad
- **Compilación de TypeScript** incluida

### Docker Compose
- **Servicio de aplicación** (Node.js/Express)
- **Servicio de MongoDB** (base de datos)
- **Red personalizada** para comunicación entre servicios
- **Volúmenes persistentes** para datos de MongoDB

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Ejecutar en modo desarrollo con hot reload
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
docker-compose logs -f

# Entrar al contenedor
docker-compose exec app sh

# Reiniciar servicios
docker-compose restart

# Limpiar recursos no utilizados
docker system prune -a
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

### Verificar conectividad
```bash
# Probar la API
curl http://localhost:3000

# Conectar a MongoDB
docker-compose exec mongo mongosh
```

## 🔒 Seguridad

- Usuario no-root en contenedores
- Variables de entorno para configuración
- Red aislada entre servicios
- Volúmenes persistentes para datos

## 🚨 Troubleshooting

### Problema: La aplicación no se conecta a MongoDB
```bash
# Verificar que MongoDB esté corriendo
docker-compose ps mongo

# Ver logs de MongoDB
docker-compose logs mongo

# Verificar conectividad
docker-compose exec app ping mongo
```

### Problema: Puerto ya en uso
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Cambiar 3000 por 3001
```

### Problema: Errores de compilación
```bash
# Limpiar cache de Docker
docker system prune -a

# Reconstruir sin cache
docker-compose build --no-cache
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

## 📝 Notas Importantes

1. **Backup de datos**: Los datos de MongoDB se guardan en volúmenes Docker
2. **Variables de entorno**: Nunca committear archivos `.env` con credenciales
3. **Logs**: Configurar rotación de logs para producción
4. **Monitoreo**: Implementar health checks y métricas
5. **SSL**: Configurar certificados SSL para producción

## 🆘 Soporte

Si encuentras problemas:
1. Revisar logs: `docker-compose logs`
2. Verificar estado: `docker-compose ps`
3. Reconstruir: `docker-compose build --no-cache`
4. Limpiar: `docker system prune -a` 