console.log("Hola TS!");

import express from "express";
import { connectDB } from "./config/db";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);
app.use(express.json());

// Conexión y arranque del servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});