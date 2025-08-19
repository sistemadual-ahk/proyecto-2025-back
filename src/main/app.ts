import express from "express";
import { routes } from "@routes/routes";
import { errorHandler } from "@middlewares/error.middleware";
const cors = require('cors');

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(cors());

// Middleware de log
app.use((req, _res, next) => {
  console.log(`Método: ${req.method} - URL: ${req.url}`);
  next();
});

routes.forEach(route => app.use(route.path, route.handler));

app.use(errorHandler);

export default app;
