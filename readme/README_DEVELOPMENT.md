# 🚀 Guía de Desarrollo - proyecto-2025-back

## 📋 Prerrequisitos

### Opción 1: Docker (Recomendado)
- Docker Desktop instalado
- Docker Compose instalado

### Opción 2: Desarrollo Local
- Node.js 18+ instalado
- MongoDB instalado o cuenta de MongoDB Atlas

## 🚀 Inicio Rápido

### Con Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/proyecto-2025-back.git
cd proyecto-2025-back

# 2. Crear archivo de variables de entorno
cp env.example .env

# 3. Ejecutar con Docker
docker-compose up --build -d

# 4. ¡Listo! La aplicación está en http://localhost:3000
```

### Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/proyecto-2025-back.git
cd proyecto-2025-back

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp env.example .env

# 4. Ejecutar en modo desarrollo
npm start
```

## 🔧 Comandos Útiles

### Docker
```bash
# Encender servicios
docker-compose up --build -d

# Ver logs
docker-compose logs -f app

# Parar servicios
docker-compose down

# Reconstruir
docker-compose up --build -d

# Entrar al contenedor
docker-compose exec app sh
```

### Desarrollo Local
```bash
# Ejecutar en modo desarrollo
npm start

# Ejecutar tests
npm test

# Compilar TypeScript
npm run build
```

## 📊 Testing

### Probar la API
```bash
# Con PowerShell
.\test-api.ps1

# Comandos manuales
(Invoke-WebRequest -Uri "http://localhost:3000/api/saludos").Content
```

## 🌐 Endpoints Disponibles

- **GET** `http://localhost:3000/api/saludos` - Saludo inicial
- **POST** `http://localhost:3000/api/saludos/saludar` - Saludar con nombre

## 🔧 Configuración

### Variables de Entorno (.env)
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/db
```

## 📁 Estructura del Proyecto

```
proyecto-2025-back/
├── src/
│   ├── main/
│   │   ├── app.ts
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── services/
│   ├── config/
│   └── index.ts
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## 🐛 Troubleshooting

### Problema: Puerto en uso
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"
```

### Problema: Error de conexión a MongoDB
```bash
# Verificar variables de entorno
cat .env

# Ver logs de MongoDB
docker-compose logs mongo
```

## 📚 Recursos

- [Documentación Docker](DOCKER_IMPLEMENTATION_GUIDE.md)
- [Referencia Rápida](DOCKER_QUICK_REFERENCE.md)
- [Comandos de Testing](comandos-test.md) 