Write-Host "Probando API de proyecto-2025-back..." -ForegroundColor Green

# Esperar un momento para que la aplicación esté lista
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Probando endpoint GET /api/saludos:" -ForegroundColor Yellow
$response1 = Invoke-WebRequest -Uri "http://localhost:3000/api/saludos" -Method GET
Write-Host $response1.Content

Write-Host ""
Write-Host "Probando endpoint POST /api/saludos/saludar:" -ForegroundColor Yellow
$response2 = Invoke-WebRequest -Uri "http://localhost:3000/api/saludos/saludar" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"nombre":"Juan"}'
Write-Host $response2.Content

Write-Host ""
Write-Host "Probando endpoint POST sin nombre (debe dar error):" -ForegroundColor Yellow
try {
    $response3 = Invoke-WebRequest -Uri "http://localhost:3000/api/saludos/saludar" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{}'
    Write-Host $response3.Content
} catch {
    Write-Host $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host $responseBody -ForegroundColor Red
}

Write-Host ""
Write-Host "Pruebas completadas!" -ForegroundColor Green 