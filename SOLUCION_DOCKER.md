# Solución al Error de Docker - Cannot find module '@routes/routes'

## 🔍 Análisis del Problema

El error `Cannot find module '@routes/routes'` ocurre porque:

1. **TypeScript no resuelve alias de paths en compilación**: Los alias como `@routes/*` solo funcionan en desarrollo con `ts-node` y `tsconfig-paths`
2. **Node.js no entiende alias en producción**: En el contenedor Docker, Node.js necesita que los paths estén resueltos o configurados
3. **Falta configuración de resolución de paths**: El `tsconfig-paths-bootstrap.js` no se estaba usando correctamente

## ✅ Solución Implementada

### 1. Dockerfile Actualizado
- Se agregó la copia del archivo `tsconfig-paths-bootstrap.js`
- Se modificó el comando de inicio para usar el bootstrap: `node -r ./tsconfig-paths-bootstrap.js dist/index.js`

### 2. Variables de Entorno Configuradas
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://ezequiel_escobar:kqnzhfDeCwRFnuMS@ahk.xh0jhbc.mongodb.net
MONGODB_PARAMS=retryWrites=true&w=majority&appName=AHK
MONGODB_DB_NAME=main
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

### 3. docker-compose.yml Actualizado
- Se agregaron todas las variables de entorno necesarias
- Se configuró para desarrollo

### 4. tsconfig-paths-bootstrap.js Mejorado
- Se agregaron logs para verificar que los paths se registren correctamente
- Se asegura que la resolución funcione en producción

## 🚀 Comandos para Ejecutar

### Opción 1: Usando PowerShell (Windows)
```powershell
.\test-api.ps1
```

### Opción 2: Usando Bash (Linux/Mac)
```bash
chmod +x test-docker.sh
./test-docker.sh
```

### Opción 3: Manual
```bash
# Detener contenedores
docker-compose down

# Limpiar cache
docker system prune -f

# Reconstruir
docker-compose build --no-cache

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs app
```

## 🔧 Verificación

Para verificar que todo funciona:

1. **Revisar logs**: `docker-compose logs app`
2. **Probar API**: `curl http://localhost:3000/api/saludos`
3. **Verificar conexión a MongoDB**: Los logs deben mostrar "✅ MongoDB conectado"

## 📝 Notas Importantes

- El archivo `.env` debe crearse manualmente con las variables proporcionadas
- Los alias de paths ahora funcionan tanto en desarrollo como en producción
- La aplicación está configurada para desarrollo (`NODE_ENV=development`)
- MongoDB Atlas está configurado con las credenciales proporcionadas

## 🐛 Troubleshooting

Si el error persiste:

1. **Verificar que el bootstrap se ejecute**: Los logs deben mostrar "✅ tsconfig-paths registrado"
2. **Revisar estructura de archivos**: Asegurar que `dist/` contenga todos los archivos compilados
3. **Verificar variables de entorno**: Confirmar que todas las variables estén definidas
4. **Limpiar cache de Docker**: `docker system prune -a`

## 📚 Referencias

- [tsconfig-paths](https://github.com/dividab/tsconfig-paths)
- [Docker multi-stage builds](https://docs.docker.com/develop/dev-best-practices/multistage-build/)
- [TypeScript path mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
