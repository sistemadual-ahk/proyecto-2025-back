import { Router } from "express";
import { ObjetivoController} from "@controllers/objetivo.controller";

export const createObjetivoRoutes = (objetivoController: ObjetivoController): Router => {
    const router = Router();

    router.get('/', objetivoController.getAllObjetivos);
    
    router.get('/:id', objetivoController.getObjetivoById);
    
    router.post('/', objetivoController.createObjetivo);
    
    router.put('/:id', objetivoController.updateObjetivo);
    
    router.delete('/:id', objetivoController.deleteObjetivo);

    return router;
};
