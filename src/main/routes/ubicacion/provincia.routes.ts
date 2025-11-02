import { Router } from "express";
import { ProvinciaController } from "@controllers/ubicacion/provincia.controller";

export const createProvinciaRoutes = (ubicacionController: ProvinciaController): Router => {
    const router = Router();

    router.get("/all", ubicacionController.getAllProvincias);
    router.get("/", ubicacionController.getAllProvincias);

    return router;
};
