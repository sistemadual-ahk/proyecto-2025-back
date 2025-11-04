import { Request, Response } from "express";
import { ProvinciaService } from "@services/ubicacion/provincia.service";
import { asyncHandler, ValidationError } from "../../middlewares/error.middleware";
import { BaseController } from "../base.controller";

export class ProvinciaController extends BaseController {
    constructor(private provinciaService: ProvinciaService) {
        super();
    }

    getAllProvincias = asyncHandler(async (_req: Request, res: Response) => {
        const provincias = await this.provinciaService.findAll();
        return this.sendSuccess(res, 200, provincias, "Provincias obtenidas correctamente");
    });

    // Para verificar datos antes de enviar a la DB desde front
    verificar = asyncHandler(async (_req: Request, res: Response) => {
        // Verifica query completo
        const { provincia, municipio, localidad } = _req.query;
        if (!provincia || !municipio || !localidad) {
            throw new ValidationError("Para verificar hace falta provincia, municipio y localidad");
        }

        // Realiza validacion con DB
        const solicitudValida = await this.provinciaService.verificarUbicacionCompleta(String(provincia), String(municipio), String(localidad));

        // debug para mostrar
        const debugMsgUbicacion = `${provincia} > ${municipio} > ${localidad}`;

        return this.sendSuccess(res, 200, { solicitudValida }, solicitudValida ? `Ubicacion verificada y existente: ${debugMsgUbicacion}` : `Ubicación no encontrada: ${debugMsgUbicacion}`);
    });
}
