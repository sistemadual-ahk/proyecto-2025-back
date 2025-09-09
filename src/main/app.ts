// src/app.ts
import express from "express";
import { routes } from "@routes/routes";
import { errorHandler } from "@middlewares/error.middleware";
import { checkJwt } from "@middlewares/auth.middleware";
import { syncUser } from "@middlewares/sync-user.middleware"; // Importa el middleware de sincronización
const cors = require('cors');

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(cors());

// middleware auth0
// Aplica checkJwt y syncUser en ese orden
app.use('/api', checkJwt, syncUser);

// Middleware de log
app.use((req, _res, next) => {
  console.log(`Método: ${req.method} - URL: ${req.url}`);
  next();
});

routes.forEach(route => app.use(route.path, route.handler));

app.use(errorHandler);

export default app;