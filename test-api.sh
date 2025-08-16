#!/bin/bash

echo "🧪 Probando API de proyecto-2025-back..."

# Esperar un momento para que la aplicación esté lista
sleep 2

echo ""
echo "📋 Probando endpoint GET /api/saludos:"
curl -s http://localhost:3000/api/saludos | jq .

echo ""
echo "📋 Probando endpoint POST /api/saludos/saludar:"
curl -s -X POST http://localhost:3000/api/saludos/saludar \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan"}' | jq .

echo ""
echo "📋 Probando endpoint POST sin nombre (debe dar error):"
curl -s -X POST http://localhost:3000/api/saludos/saludar \
  -H "Content-Type: application/json" \
  -d '{}' | jq .

echo ""
echo "✅ Pruebas completadas!" 