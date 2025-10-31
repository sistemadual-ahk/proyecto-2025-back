import { Router } from "express";
import { BilleteraController } from "@controllers/billetera.controller";

export const createBilleteraRoutes = (billeteraController: BilleteraController): Router => {
    const router = Router();

    router.get('/all', billeteraController.getAllBilleteras);

    router.get('/', billeteraController.getAllBilleterasForUser);
    
    router.get('/:id', billeteraController.getBilleteraById);
    
    router.post('/', billeteraController.createBilletera);
    
    router.put('/:id', billeteraController.updateBilletera);

    router.patch('/:id', billeteraController.updateBilleteraDefault);

    router.delete('/:id', billeteraController.deleteBilletera);

    return router;
};
