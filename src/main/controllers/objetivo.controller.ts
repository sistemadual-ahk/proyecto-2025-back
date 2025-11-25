import { Response } from "express";
import { ObjetivoService } from "@services/objetivo.service";
import {
  asyncHandler,
  ValidationError,
} from "../middlewares/error.middleware";
import { BaseController } from "./base.controller";
import { RequestWithAuth } from "@middlewares/sync-user.middleware";

export class ObjetivoController extends BaseController {
  constructor(private objetivoService: ObjetivoService) {
    super();
  }

  getAllObjetivos = asyncHandler(
    async (req: RequestWithAuth, res: Response) => {
      const userID = req.dbUser?.id;
      if (!userID) throw new ValidationError("Usuario no autenticado");
      const objetivos = await this.objetivoService.findAll(userID);
      return this.sendSuccess(res, 200, objetivos);
    }
  );

  getObjetivoById = asyncHandler(
    async (req: RequestWithAuth, res: Response) => {
      const { id } = req.params;
      if (!id) throw new ValidationError("ID de objetivo es requerido");

      const userID = req.dbUser?.id;
      if (!userID) throw new ValidationError("Usuario no autenticado");

      const objetivo = await this.objetivoService.findById(id, userID);
      return this.sendSuccess(
        res,
        200,
        objetivo,
        "Objetivo encontrado exitosamente"
      );
    }
  );

  createObjetivo = asyncHandler(
    async (req: RequestWithAuth, res: Response) => {
      const userID = req.dbUser?.id;
      if (!userID) throw new ValidationError("Usuario no autenticado");

      const objetivoData = req.body;
      const nuevoObjetivo = await this.objetivoService.create(
        objetivoData,
        userID
      );
      return this.sendSuccess(
        res,
        201,
        nuevoObjetivo,
        "Objetivo creado correctamente"
      );
    }
  );

  updateObjetivo = asyncHandler(
    async (req: RequestWithAuth, res: Response) => {
      const { id } = req.params;
      const objetivoData = req.body;
      if (!id) throw new ValidationError("ID de objetivo es requerido");

      const userID = req.dbUser?.id;
      if (!userID) throw new ValidationError("Usuario no autenticado");

      const objetivoActualizado = await this.objetivoService.update(
        id,
        objetivoData,
        userID
      );
      return this.sendSuccess(
        res,
        200,
        objetivoActualizado,
        "Objetivo actualizado correctamente"
      );
    }
  );

  deleteObjetivo = asyncHandler(
    async (req: RequestWithAuth, res: Response) => {
      const { id } = req.params;
      if (!id) throw new ValidationError("ID de objetivo es requerido");

      const userID = req.dbUser?.id;
      if (!userID) throw new ValidationError("Usuario no autenticado");

      const resultado = await this.objetivoService.delete(id, userID);
      return this.sendSuccess(
        res,
        200,
        resultado,
        "Objetivo eliminado correctamente"
      );
    }
  );
}
