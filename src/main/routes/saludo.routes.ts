import express from "express";
import { saludoInicial, saludarNombre } from "../controllers/saludo.controller";

const router = express.Router();

// Definición de endpoints y su controlador correspondiente
router.get("/", saludoInicial);
router.post("/saludar", saludarNombre);

export default router;
