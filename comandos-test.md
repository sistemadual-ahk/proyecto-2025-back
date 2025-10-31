# Comandos para probar la API

## PowerShell

### Probar endpoint GET
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/saludos" -Method GET
```

### Probar endpoint POST con nombre
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/saludos/saludar" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"nombre":"Juan"}'
```

### Probar endpoint POST sin nombre (error)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/saludos/saludar" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{}'
```

## Comandos simples

### GET request
```powershell
(Invoke-WebRequest -Uri "http://localhost:3000/api/saludos").Content
```

### POST request
```powershell
(Invoke-WebRequest -Uri "http://localhost:3000/api/saludos/saludar" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"nombre":"Maria"}').Content
```

## Script automático
```powershell
.\test-api.ps1
```

## Encender servicios
```powershell
docker-compose up --build -d
```

## Verificar estado del contenedor
```powershell
docker-compose ps
```

## Ver logs
```powershell
docker-compose logs app
``` 