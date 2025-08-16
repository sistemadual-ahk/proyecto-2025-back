import { Request, Response } from "express";
import { ObjetivoService } from "@services/objetivo.service";
import { asyncHandler, ValidationError } from "../middlewares/error.middleware";
import { BaseController } from "./base.controller";

export class ObjetivoController extends BaseController {
    constructor(private objetivoService: ObjetivoService) {
        super();
    }

    getAllObjetivos = asyncHandler(async (_req: Request, res: Response) => {
        const objetivos = await this.objetivoService.findAll();
        return this.sendSuccess(res, 200, objetivos);
    });

    getObjetivoById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new ValidationError('ID de objetivo es requerido');
        const objetivo = await this.objetivoService.findById(id);
        return this.sendSuccess(res, 200, objetivo, 'Objetivo encontrado exitosamente');
    });

    createObjetivo = asyncHandler(async (req: Request, res: Response) => {
        const objetivoData = req.body;
        const nuevoObjetivo = await this.objetivoService.create(objetivoData);
        return this.sendSuccess(res, 201, nuevoObjetivo, 'Objetivo creado correctamente');
    });

    updateObjetivo = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const objetivoData = req.body;
        if (!id) throw new ValidationError('ID de objetivo es requerido');
        const objetivoActualizado = await this.objetivoService.update(id, objetivoData);
        return this.sendSuccess(res, 200, objetivoActualizado, 'Objetivo actualizado correctamente');
    });

    deleteObjetivo = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new ValidationError('ID de objetivo es requerido');
        const resultado = await this.objetivoService.delete(id);
        return this.sendSuccess(res, 200, resultado, 'Objetivo eliminado correctamente');
    });
}
