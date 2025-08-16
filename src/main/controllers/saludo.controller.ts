import { Request, Response } from "express";
import { saludoService } from "@services/saludo.service";
import { BaseController } from "./base.controller";
import { ValidationError } from "@middlewares/error.middleware";

export class SaludoController extends BaseController {

  public obtenerSaludoGenerico = (_req: Request, res: Response): Response => {
    const mensaje = saludoService.obtenerSaludoGenerico();
    return this.sendSuccess(res, 200, mensaje, "Saludo obtenido exitosamente");
  };

  public saludarNombre = (req: Request, res: Response): Response => {
    const { nombre } = req.body;

    if (!saludoService.validarNombre(nombre)) {
      throw new ValidationError("Error de validación", ["El campo 'nombre' es requerido y no puede estar vacío"]);
    }

    const mensaje = saludoService.obtenerMensajeSaludo(nombre);
    return this.sendSuccess(res, 200, mensaje, "Saludo personalizado generado exitosamente");
  };

  public validarNombre = (req: Request, res: Response): Response => {
    const { nombre } = req.body;
    const esValido = saludoService.validarNombre(nombre);
    
    return this.sendSuccess(res, 200, { 
      nombre, 
      esValido 
    }, esValido ? "Nombre válido" : "Nombre inválido");
  };
}

export const saludoController = new SaludoController();