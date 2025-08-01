#!/bin/bash

echo "🧪 Probando construcción de Docker..."

# Limpiar contenedores y imágenes anteriores
echo "🧹 Limpiando recursos anteriores..."
docker-compose down
docker system prune -f

# Construir solo la imagen para probar
echo "🔨 Construyendo imagen de Docker..."
docker build -t proyecto-2025-back-test .

if [ $? -eq 0 ]; then
    echo "✅ Construcción exitosa!"
    echo "🚀 Ahora puedes ejecutar: docker-compose up -d"
else
    echo "❌ Error en la construcción. Revisa los logs arriba."
    exit 1
fi 