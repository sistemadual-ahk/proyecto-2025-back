import { Request, Response } from "express";
import { OperacionService } from "@services/operacion.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { BaseController } from "./base.controller";
import { ValidationError } from "../middlewares/error.middleware";

interface RequestWithAuth extends Request {
    dbUser?: { id: string };
}

export class OperacionController extends BaseController {
    constructor(private operacionService: OperacionService) {
        super();
    }

    getAllOperaciones = asyncHandler(async (_req: Request, res: Response) => {
        const operaciones = await this.operacionService.findAll();
        return this.sendSuccess(res, 200, operaciones);
    });

    getAllOperacionesIngresos = asyncHandler(async (_req: Request, res: Response) => {
    const operaciones = await this.operacionService.findAllIngresos();
    return this.sendSuccess(res, 200, operaciones);
    });

    getAllOperacionesEgresos = asyncHandler(async (_req: Request, res: Response) => {
        const operaciones = await this.operacionService.findAllEgresos();
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

    createOperacion = asyncHandler(async (req: RequestWithAuth, res: Response) => {
        const userId = req.dbUser?.id;
        if(!userId){
            // ! Esto debería ser imposible si la ruta está protegida por el middleware de syncUser???
            throw new ValidationError('No se pudo determinar el usuario autenticado.');
        }
        // CREAR EL OBJETO DE DATOS FINAL, INYECTANDO EL ID DEL USUARIO
        const operacionData = {
            ...req.body,
            user: userId
        };

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