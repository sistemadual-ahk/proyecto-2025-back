import express from "express";
import saludoRoutes from "./routes/saludo.routes";

const app = express();
app.set("trust proxy", true);
app.use(express.json());

// Middleware de log
app.use((req, res, next) => {
  console.log(`Método: ${req.method} - URL: ${req.url}`);
  next();
});

// Rutas a USAR----> Aquí se definen las rutas a utilizar de la aplicación.
const routes = [
  { path: "/api/saludos", handler: saludoRoutes },
];
routes.forEach(route => app.use(route.path, route.handler));

export default app;
