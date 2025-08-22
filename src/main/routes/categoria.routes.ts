import { Router } from "express";
import { CategoriaController } from "../controllers/categoria.controller";

export const createCategoriaRoutes = (categoriaController: CategoriaController): Router => {
    const router = Router();

    router.get('/all', categoriaController.getAllCategorias);

    router.get('/', categoriaController.getAllCategoriasForUser);

    router.get('/:id', categoriaController.getCategoriaById);

    router.get('/user/:id', categoriaController.getCategoriaByUser);

    router.post('/', categoriaController.createCategoria);

    router.put('/:id', categoriaController.updateCategoria);

    router.delete('/:id', categoriaController.deleteCategoria);

    return router;
}; 