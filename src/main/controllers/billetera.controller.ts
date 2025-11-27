import { Request, Response } from "express";
import { BilleteraService } from "@services/billetera.service";
import { asyncHandler, ValidationError } from "../middlewares/error.middleware";
import { BaseController } from "./base.controller";
import { RequestWithAuth } from "@middlewares/sync-user.middleware";

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
        if (!id) throw new ValidationError("ID de billetera es requerido");
        const billetera = await this.billeteraService.findById(id);
        return this.sendSuccess(res, 200, billetera, "Billetera encontrada exitosamente");
    });

    getAllBilleterasForUser = asyncHandler(async (req: RequestWithAuth, res: Response) => {
        const userID = req.dbUser?.id;
        console.log("UserID en getAllBilleterasForUser:", userID);
        if (!userID) {
            throw new ValidationError("ID de usuario no encontrado en la petición");
        }
        //req.auth.user.
        const billeteras = await this.billeteraService.findAllForUser(userID);
        return this.sendSuccess(res, 200, billeteras);
    });

    createBilletera = asyncHandler(async (req: RequestWithAuth, res: Response) => {
        const userID = req.dbUser?.id;
        const billeteraData = req.body;
        const nuevaBilletera = await this.billeteraService.create(billeteraData, userID);
        return this.sendSuccess(res, 201, nuevaBilletera, "Billetera creada correctamente");
    });

    updateBilletera = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const billeteraData = req.body;
        if (!id) throw new ValidationError("ID de billetera es requerido");
        const billeteraActualizada = await this.billeteraService.update(id, billeteraData);
        return this.sendSuccess(res, 200, billeteraActualizada, "Billetera actualizada correctamente");
    });


    updateBilleteraDefault = asyncHandler(async (req: RequestWithAuth, res: Response) => {
        const { id } = req.params;
        const userId = req.dbUser?.id; // viene del middleware de autenticación

        if (!id) throw new ValidationError("ID de billetera es requerido");
        if (!userId) throw new ValidationError("Usuario no autenticado");

        const billeteraActualizada = await this.billeteraService.updateDefault(id, undefined, userId);

        return this.sendSuccess(res, 200, billeteraActualizada, "Billetera actualizada correctamente");
    });


    deleteBilletera = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new ValidationError("ID de billetera es requerido");
        const resultado = await this.billeteraService.delete(id);
        return this.sendSuccess(res, 200, resultado, "Billetera eliminada correctamente");
    });
}
