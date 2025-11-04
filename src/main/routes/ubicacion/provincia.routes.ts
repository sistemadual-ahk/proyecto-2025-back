import { Router } from "express";
import { ProvinciaController } from "@controllers/ubicacion/provincia.controller";

export const createProvinciaRoutes = (provinciaController: ProvinciaController): Router => {
    const router = Router();

    router.get("/all", provinciaController.getAllProvincias);
    router.get("/", provinciaController.getAllProvincias);
    router.get("/verificar", provinciaController.verificar);

    return router;
};
