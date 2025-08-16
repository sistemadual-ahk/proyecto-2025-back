# Script de prueba para Docker en PowerShell
Write-Host "🐳 Iniciando pruebas de Docker..." -ForegroundColor Green

# Detener contenedores existentes
Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose down

# Limpiar imágenes
Write-Host "🧹 Limpiando imágenes..." -ForegroundColor Yellow
docker system prune -f

# Reconstruir imagen
Write-Host "🔨 Reconstruyendo imagen..." -ForegroundColor Yellow
docker-compose build --no-cache

# Iniciar servicios
Write-Host "🚀 Iniciando servicios..." -ForegroundColor Yellow
docker-compose up -d

# Esperar un momento para que el servicio se inicie
Write-Host "⏳ Esperando que el servicio se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar logs
Write-Host "📋 Verificando logs..." -ForegroundColor Yellow
docker-compose logs app

# Probar la API
Write-Host "🧪 Probando la API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/saludos" -Method GET
    Write-Host "✅ API responde correctamente" -ForegroundColor Green
    Write-Host "Respuesta: $($response | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ API no responde: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "✅ Pruebas completadas" -ForegroundColor Green 