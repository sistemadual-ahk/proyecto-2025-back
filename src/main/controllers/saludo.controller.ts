import { Request, Response } from "express";
import { obtenerMensajeSaludo } from "../services/saludo.service";
import { enviarRespuesta, enviarError } from "./base.controller";

// ----------------------- Controlador para manejar las solicitud de las rutas a probar (endpoints) -----------------------
// Maneja el Request y Response. Revisa si falta algo, responde o manda errores. Llama a los services para la lógica.
export const saludoInicial = (_req: Request, res: Response) => {
  return enviarRespuesta(res, 200, "¡Hola desde la API con TypeScript y Express!");
};

export const saludarNombre = (req: Request, res: Response) => {
  const { nombre } = req.body;
  if (!nombre) {
    return enviarError(res, 400, "Falta el campo 'nombre'");
  }
  // Llama al service para obtener el mensaje de saludo (también podría ser una función de lógica de negocio o simplmente colocar aquí la lógica)
  const mensaje = obtenerMensajeSaludo(nombre);
  return enviarRespuesta(res, 200, mensaje);
};


// para hacer llamados a la BD se debe utilizar async/await