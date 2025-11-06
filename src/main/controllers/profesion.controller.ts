import { Request, Response } from "express";
import { asyncHandler, ValidationError } from "@middlewares/error.middleware";
import { BaseController } from "./base.controller";
import { ProfesionService } from "@services/profesion.service";

export class ProfesionController extends BaseController {
    constructor(private profesionService: ProfesionService) {
        super();
    }

    getAllProfesiones = asyncHandler(async (_req: Request, res: Response) => {
        const profesiones = await this.profesionService.findAll();
        return this.sendSuccess(res, 200, profesiones);
    });

    getProfesionById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new ValidationError("ID de profesión es requerido");
        const profesion = await this.profesionService.findById(id);
        return this.sendSuccess(res, 200, profesion, "Profesión encontrada exitosamente");
    });
}
