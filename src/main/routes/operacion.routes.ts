import { Router } from "express";
import { OperacionController } from "@controllers/operacion.controller";

export const createOperacionRoutes = (operacionController: OperacionController): Router => {
    const router = Router();

    router.get('/', operacionController.getAllOperaciones);

    router.get('/egresos', operacionController.getAllOperacionesEgresos);

    router.get('/ingresos', operacionController.getAllOperacionesIngresos);

    router.get('/:id', operacionController.getOperacionById);

    router.post('/', operacionController.createOperacion);

    router.put('/:id', operacionController.updateOperacion);

    router.delete('/:id', operacionController.deleteOperacion);

    return router;
};