import { Router } from "express";

import { ProfesionController } from "@controllers/profesion.controller";

export const createProfesionRoutes = (profesionController: ProfesionController): Router => {
    const router = Router();
    router.get("/", profesionController.getAllProfesiones);

    router.get("/:id", profesionController.getProfesionById);
    return router;
};
