// src/app.ts
import express from "express";
import { routes } from "@routes/routes";
import { errorHandler } from "@middlewares/error.middleware";
import { checkJwt } from "@middlewares/auth.middleware";
import { syncUser } from "@middlewares/sync-user.middleware"; // Importa el middleware de sincronización
import { telegramController } from "./config/dependencies";

const cors = require('cors');

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(cors());

// Ruta de salud sin autenticación (debe ir ANTES del middleware de auth)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// middleware auth0
// Aplica checkJwt y syncUser en ese orden
app.use(checkJwt);
app.use(syncUser); // Usa el middleware de sincronización después de checkJwt
// Middleware de log
app.use((req, _res, next) => {
  console.log(`Método: ${req.method} - URL: ${req.url}`);
  next();
});

app.use('/api', checkJwt, syncUser);

routes.forEach(route => app.use(route.path, route.handler));

telegramController.startBot();

app.use(errorHandler);

export default app;