import { Router } from "express";
import { UsuarioController } from "@controllers/usuario.controller";

export const createUsuarioRoutes = (usuarioController: UsuarioController): Router => {
    const router = Router();

    router.get('/', usuarioController.getAllUsuarios);
    router.get('/:id', usuarioController.getUsuarioById);
    router.post('/', usuarioController.createUsuario);
    router.put('/:id', usuarioController.updateUsuario);
    router.delete('/:id', usuarioController.deleteUsuario);

    return router;
};
