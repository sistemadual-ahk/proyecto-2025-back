import { Request, Response } from "express";
import { BilleteraService } from "@services/billetera.service";
import { asyncHandler, ValidationError } from "../middlewares/error.middleware";
import { BaseController } from "./base.controller";

export class BilleteraController extends BaseController {
    constructor(private billeteraService: BilleteraService) {
        super();
    }

    getAllBilleteras = asyncHandler(async (_req: Request, res: Response) => {
        const billeteras = await this.billeteraService.findAll();
        return this.sendSuccess(res, 200, billeteras);
    });

    getBilleteraById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new ValidationError('ID de billetera es requerido');
        const billetera = await this.billeteraService.findById(id);
        return this.sendSuccess(res, 200, billetera, 'Billetera encontrada exitosamente');
    });

    createBilletera = asyncHandler(async (req: Request, res: Response) => {
        const billeteraData = req.body;
        const nuevaBilletera = await this.billeteraService.create(billeteraData);
        return this.sendSuccess(res, 201, nuevaBilletera, 'Billetera creada correctamente');
    });

    updateBilletera = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const billeteraData = req.body;
        if (!id) throw new ValidationError('ID de billetera es requerido');
        const billeteraActualizada = await this.billeteraService.update(id, billeteraData);
        return this.sendSuccess(res, 200, billeteraActualizada, 'Billetera actualizada correctamente');
    });

    deleteBilletera = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new ValidationError('ID de billetera es requerido');
        const resultado = await this.billeteraService.delete(id);
        return this.sendSuccess(res, 200, resultado, 'Billetera eliminada correctamente');
    });
}
