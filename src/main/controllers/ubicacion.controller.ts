import { asyncHandler } from "@middlewares/error.middleware";
import { BaseController } from "./base.controller";
import { RequestWithAuth } from "@middlewares/sync-user.middleware";

export class UbicacionController extends BaseController {
    // TODO
    constructor(private ubicacionService: UbicacionService) {
        super();
    }

    getAllUbicaciones = asyncHandler(async (_req: RequestWithAuth, res: Response) => {
        const ubicaciones = await this.ubicacionService.getAll();
        return this.sendSuccess(res, 200, ubicaciones);
    });

}