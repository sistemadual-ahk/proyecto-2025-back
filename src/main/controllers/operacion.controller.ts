import { Response } from "express";
import { OperacionService } from "@services/operacion.service";
import {
  asyncHandler,
  ValidationError,
} from "../middlewares/error.middleware";
import { BaseController } from "./base.controller";
import { RequestWithAuth } from "@middlewares/sync-user.middleware";

export class OperacionController extends BaseController {
  constructor(private operacionService: OperacionService) {
    super();
  }

  getAllOperaciones = asyncHandler(
    async (req: RequestWithAuth, res: Response) => {
      const { tipo, categoriaId, billeteraId, desde, hasta } = req.query as any;

      const userId = req.dbUser?.id;
      if (!userId) {
        throw new ValidationError(
          "No se pudo determinar el usuario para filtrar las operaciones."
        );
      }

      if (!tipo && !categoriaId && !billeteraId && !desde && !hasta) {
        const operaciones = await this.operacionService.findAllForUser(userId);
        return this.sendSuccess(res, 200, operaciones);
      }

      const operaciones = await this.operacionService.findByFilters({
        userId,
        tipo,
        categoriaId,
        billeteraId,
        desde,
        hasta,
      });
      return this.sendSuccess(res, 200, operaciones);
    }
  );

  getAllOperacionesIngresos = asyncHandler(
    async (req: RequestWithAuth, res: Response) => {
      const userID = req.dbUser?.id;
      if (!userID) throw new ValidationError("Usuario no autenticado");

      const operaciones = await this.operacionService.findAllIngresosForUser(
        userID
      );
      return this.sendSuccess(res, 200, operaciones);
    }
  );

  getAllOperacionesEgresos = asyncHandler(
    async (req: RequestWithAuth, res: Response) => {
      const userID = req.dbUser?.id;
      if (!userID) throw new ValidationError("Usuario no autenticado");

      const operaciones = await this.operacionService.findAllEgresosForUser(
        userID
      );
      return this.sendSuccess(res, 200, operaciones);
    }
  );

  getOperacionById = asyncHandler(
    async (req: RequestWithAuth, res: Response) => {
      const { id } = req.params;
      const userId = req.dbUser?.id;
      if (!id) throw new ValidationError("ID de operacion es requerido");
      if (!userId) throw new ValidationError("Usuario no autenticado");

      const operacion = await this.operacionService.findById(id, userId);

      return this.sendSuccess(
        res,
        200,
        operacion,
        "Operacion encontrada exitosamente"
      );
    }
  );

  createOperacion = asyncHandler(
    async (req: RequestWithAuth, res: Response) => {
      const userId = req.dbUser?.id;
      if (!userId)
        throw new ValidationError(
          "No se pudo determinar el usuario autenticado."
        );

      const operacionData = {
        ...req.body,
        user: userId,
      };

      const nuevaOperacion = await this.operacionService.create(operacionData);
      return this.sendSuccess(
        res,
        201,
        nuevaOperacion,
        "Operacion creada correctamente"
      );
    }
  );

  updateOperacion = asyncHandler(
    async (req: RequestWithAuth, res: Response) => {
      const { id } = req.params;
      const userId = req.dbUser?.id;
      const operacionData = req.body;

      if (!id) throw new ValidationError("ID de operacion es requerido");
      if (!userId) throw new ValidationError("Usuario no autenticado");

      const operacionActualizada = await this.operacionService.update(
        id,
        operacionData,
        userId
      );
      return this.sendSuccess(
        res,
        200,
        operacionActualizada,
        "Operacion actualizada correctamente"
      );
    }
  );

  deleteOperacion = asyncHandler(
    async (req: RequestWithAuth, res: Response) => {
      const { id } = req.params;
      const userId = req.dbUser?.id;
      if (!id) throw new ValidationError("ID de operacion es requerido");
      if (!userId) throw new ValidationError("Usuario no autenticado");

      const resultado = await this.operacionService.delete(id, userId);
      return this.sendSuccess(
        res,
        200,
        resultado,
        "Operacion eliminada correctamente"
      );
    }
  );
}
