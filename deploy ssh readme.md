## Guía rápida de despliegue (SSH + Docker Compose + Traefik)

### 1) Conexión por SSH
```bash
ssh ahk@vps1.disilab.cpci.org.ar
```

### 2) Preparar carpeta del proyecto
```bash
cd ~
mkdir -p proyecto-2025-back
cd proyecto-2025-back
```

### 3) Clonar repo y cambiar de rama
```bash
git clone <URL-REPO>/proyecto-2025-back.git
cd proyecto-2025-back
git fetch --all
git checkout <rama-a-desplegar>   # p.ej.: main o develop
git pull
```

### 4) Generar y completar variables de entorno
```bash
node scripts/create-env.js
nano .env   # completa MONGODB_URI, MONGODB_DB_NAME, AUTH0_*, etc.
```

### 5) Levantar con Docker Compose (detrás de Traefik)
- Requisitos del servicio `app` en `docker-compose.yml`:
  - `networks: [web]` (y `networks.web.external: true` al final)
  - `expose: ["3000"]` (no publicar puertos con `ports:`)
  - `labels` de Traefik con router único (ej.: `back-gastify`) y dominio
```bash
docker compose up -d   # o: docker-compose up -d
```

### 6) Permitir conexión a MongoDB Atlas (si aplica)
- Obtener IP pública del VPS y agregarla en Atlas → Network Access:
```bash
curl -s ifconfig.me
```
- Reiniciar la app tras autorizar la IP:
```bash
docker compose restart app
```

### 7) Verificación
```bash
docker compose ps
docker logs --tail=200 proyecto-2025-back-app-1
docker inspect proyecto-2025-back-app-1 --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}'
docker inspect proyecto-2025-back-app-1 --format '{{range $k,$v := .Config.Labels}}{{$k}}={{$v}}{{"\n"}}{{end}}'
docker exec -it proyecto-2025-back-app-1 sh -lc 'wget -qO- http://127.0.0.1:3000/health || true'
curl -kI https://<tu-dominio-traefik>   # ej: https://back-gastify.labo.disilab.cpci.org.ar
```

### 8) Actualizar despliegue (nuevos cambios)
```bash
cd ~/proyecto-2025-back/proyecto-2025-back
git pull
docker compose up -d --build
```

### 9) Bajar servicios
```bash
docker compose down
```

### Notas
- Si no puedes construir imágenes en el servidor, construye localmente y publica en un registry; luego usa `image:` en el `docker-compose.yml` y ejecuta `docker compose pull && docker compose up -d`.
- Logs de Traefik para debug: `cd /home/ahk/traefik && docker compose logs -f --tail 50 traefik`.

