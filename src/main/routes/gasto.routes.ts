import { Router } from "express";
import { GastoController } from "../controllers/gasto.controller";

export const createCategoriaRoutes = (gastoController: GastoController): Router => {
    const router = Router();

    router.get('/', gastoController.getAllGastos);

    router.get('/:id', gastoController.getGastoById);

    router.post('/', gastoController.createGasto);

    router.put('/:id', gastoController.updateGasto);

    router.delete('/:id', gastoController.deleteGasto);

    return router;
};