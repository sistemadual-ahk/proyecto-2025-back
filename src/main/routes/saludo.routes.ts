import express from "express";
import { saludoController } from "@controllers/saludo.controller";
import { asyncHandler } from "@middlewares/error.middleware";

const router = express.Router();

router.get("/", asyncHandler(saludoController.obtenerSaludoGenerico));
router.post("/saludar", asyncHandler(saludoController.saludarNombre));
router.post("/validar", asyncHandler(saludoController.validarNombre));

export default router;
