import { Request, Response } from "express";
import { OperacionService } from "@services/operacion.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { BaseController } from "./base.controller";
import { ValidationError } from "../middlewares/error.middleware";
import { RequestWithAuth } from "@middlewares/sync-user.middleware";


export class OperacionController extends BaseController {
    constructor(private operacionService: OperacionService) {
        super();
    }

    getAllOperaciones = asyncHandler(async (req: RequestWithAuth, res: Response) => {
        const { tipo, categoriaId, billeteraId, desde, hasta } = req.query as any;
        const userID = req.dbUser?.id;

        if (!tipo && !categoriaId && !billeteraId && !desde && !hasta) {
            const operaciones = await this.operacionService.findAllForUser(userID);
            return this.sendSuccess(res, 200, operaciones);
        }

        const operaciones = await this.operacionService.findByFilters({
            userID,
            tipo,
            categoriaId,
            billeteraId,
            desde,
            hasta
        });
        return this.sendSuccess(res, 200, operaciones);
    });

    getAllOperacionesIngresos = asyncHandler(async (req: RequestWithAuth, res: Response) => {
    const userID = req.dbUser?.id;
    const operaciones = await this.operacionService.findAllIngresosForUser(userID);
    return this.sendSuccess(res, 200, operaciones);
    });

    getAllOperacionesEgresos = asyncHandler(async (req: RequestWithAuth, res: Response) => {
        const userID = req.dbUser?.id;
        const operaciones = await this.operacionService.findAllEgresosForUser(userID);
        return this.sendSuccess(res, 200, operaciones);
    });

    getOperacionById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new ValidationError('ID de operacion es requerido');
        }
        const operacion = await this.operacionService.findById(id);
        return this.sendSuccess(res, 200, operacion, 'Operacion encontrada exitosamente');
    });

    createOperacion = asyncHandler(async (req: Request, res: Response) => {
        const operacionData = req.body;
        const nuevaOperacion = await this.operacionService.create(operacionData);
        return this.sendSuccess(res, 201, nuevaOperacion, 'Operacion creada correctamente');
    });

    updateOperacion = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const operacionData = req.body;
        if (!id) {
            throw new ValidationError('ID de operacion es requerido');
        }
        const operacionActualizada = await this.operacionService.update(id, operacionData);
        return this.sendSuccess(res, 200, operacionActualizada, 'Operacion actualizada correctamente');
    });

    deleteOperacion = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new ValidationError('ID de operacion es requerido');
        }
        const resultado = await this.operacionService.delete(id);
        return this.sendSuccess(res, 200, resultado, 'Operacion eliminada correctamente');
    });
}