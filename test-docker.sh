#!/bin/bash

echo "🐳 Iniciando pruebas de Docker..."

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

# Limpiar imágenes
echo "🧹 Limpiando imágenes..."
docker system prune -f

# Reconstruir imagen
echo "🔨 Reconstruyendo imagen..."
docker-compose build --no-cache

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose up -d

# Esperar un momento para que el servicio se inicie
echo "⏳ Esperando que el servicio se inicie..."
sleep 10

# Verificar logs
echo "📋 Verificando logs..."
docker-compose logs app

# Probar la API
echo "🧪 Probando la API..."
curl -X GET http://localhost:3000/api/saludos || echo "❌ API no responde"

echo "✅ Pruebas completadas" 