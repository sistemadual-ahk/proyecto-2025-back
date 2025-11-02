import { Request, Response } from "express";
import { ProvinciaService } from "@services/ubicacion/provincia.service";
import { asyncHandler } from "../../middlewares/error.middleware";
import { BaseController } from "../base.controller";

export class ProvinciaController extends BaseController {
    constructor(private provinciaService: ProvinciaService) {
        super();
    }

    getAllProvincias = asyncHandler(async (_req: Request, res: Response) => {
        const provincias = await this.provinciaService.findAll();
        return this.sendSuccess(res, 200, provincias, "Provincias obtenidas correctametne");
    });
}
