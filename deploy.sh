#!/bin/bash

# Script de despliegue para proyecto-2025-back

echo "🚀 Iniciando despliegue de proyecto-2025-back..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde env.example..."
    cp env.example .env
fi

# Parar contenedores existentes
echo "🛑 Parando contenedores existentes..."
docker-compose down

# Limpiar cache de Docker
echo "🧹 Limpiando cache de Docker..."
docker system prune -f

# Construir y levantar los servicios
echo "🔨 Construyendo y levantando servicios..."
docker-compose up --build -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 15

# Verificar el estado de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose ps

# Verificar logs
echo "📋 Logs de la aplicación:"
docker-compose logs app

echo "✅ Despliegue completado!"
echo "🌐 La aplicación está disponible en: http://localhost:3000"
echo "🗄️  MongoDB está disponible en: localhost:27017"
echo ""
echo "📝 Comandos útiles:"
echo "  - Ver logs: docker-compose logs -f"
echo "  - Parar servicios: docker-compose down"
echo "  - Reiniciar: docker-compose restart" 