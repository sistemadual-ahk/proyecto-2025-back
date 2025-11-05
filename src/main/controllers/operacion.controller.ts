// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    /**
     * CORRECCIÓN: Ahora SIEMPRE filtra por usuario, incluso si no hay query params.
     */
    getAllOperaciones = asyncHandler(async (req: RequestWithAuth, res: Response) => {
        const { tipo, categoriaId, billeteraId, desde, hasta } = req.query as any;
        const userID = req.dbUser?.id;

        // 1. Obtener el ID del usuario autenticado (CRÍTICO)
        const userId = req.dbUser?.id;
        if (!userId) {
            throw new ValidationError("No se pudo determinar el usuario para filtrar las operaciones.");
        }

        // 2. Determinar si hay filtros o no
        if (!tipo && !categoriaId && !billeteraId && !desde && !hasta) {
            const operaciones = await this.operacionService.findAllForUser(userId);
            return this.sendSuccess(res, 200, operaciones);
        }

        // 3. SI HAY FILTROS: Llama al método de filtros del servicio, pasando userId primero
        const operaciones = await this.operacionService.findByFilters({
            userID,
            tipo,
            categoriaId,
            billeteraId,
            desde,
            hasta,
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

    getOperacionById = asyncHandler(async (req: RequestWithAuth, res: Response) => {
        const { id } = req.params;
        const userId = req.dbUser?.id; // Obtener userId para validación
        if (!id) throw new ValidationError("ID de operacion es requerido");
        if (!userId) throw new ValidationError("Usuario no autenticado");

        const operacion = await this.operacionService.findById(id);

        // Validación de seguridad adicional (recomendada)
        if (operacion && (operacion.user as any)?.id !== userId) {
            throw new ValidationError("No tienes permiso para ver esta operación"); // O NotFoundError
        }

        return this.sendSuccess(res, 200, operacion, "Operacion encontrada exitosamente");
    });

    createOperacion = asyncHandler(async (req: RequestWithAuth, res: Response) => {
        const userId = req.dbUser?.id;
        if (!userId) throw new ValidationError("No se pudo determinar el usuario autenticado.");

        // Adjunta el ID del usuario al cuerpo de la petición
        const operacionData = {
            ...req.body,
            user: userId,
        };

        const nuevaOperacion = await this.operacionService.create(operacionData);
        return this.sendSuccess(res, 201, nuevaOperacion, "Operacion creada correctamente");
    });

    updateOperacion = asyncHandler(async (req: RequestWithAuth, res: Response) => {
        const { id } = req.params;
        const userId = req.dbUser?.id; // Obtener userId para validación
        const operacionData = req.body;
        if (!id) throw new ValidationError("ID de operacion es requerido");
        if (!userId) throw new ValidationError("Usuario no autenticado");

        // (Validación de seguridad recomendada: verificar que la operación pertenezca al usuario antes de actualizar)

        const operacionActualizada = await this.operacionService.update(id, operacionData);
        return this.sendSuccess(res, 200, operacionActualizada, "Operacion actualizada correctamente");
    });

    deleteOperacion = asyncHandler(async (req: RequestWithAuth, res: Response) => {
        const { id } = req.params;
        const userId = req.dbUser?.id; // Obtener userId para validación
        if (!id) throw new ValidationError("ID de operacion es requerido");
        if (!userId) throw new ValidationError("Usuario no autenticado");

        // (Validación de seguridad recomendada: verificar que la operación pertenezca al usuario antes de eliminar)

        const resultado = await this.operacionService.delete(id);
        return this.sendSuccess(res, 200, resultado, "Operacion eliminada correctamente");
    });
}
