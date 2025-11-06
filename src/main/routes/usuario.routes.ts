import { Router } from "express";
import { UsuarioController } from "@controllers/usuario.controller";

export const createUsuarioRoutes = (usuarioController: UsuarioController): Router => {
    const router = Router();

    router.get("/", usuarioController.getAllUsuarios);
    router.get("/:id", usuarioController.getUsuarioById);
    router.get("/:telegramId", usuarioController.getUsuarioByTelegramId);
    router.post("/", usuarioController.createUsuario);
    router.put("/:id", usuarioController.updateUsuario);
    router.delete("/:id", usuarioController.deleteUsuario);

    // endpoint para similares (TESTING)
    router.get("/similar/sueldo", usuarioController.getSimilarUsuarioBySueldo);
    router.get("/similar/profesion", usuarioController.getSimilarUsuarioByProfesion);
    router.get("/similar/ubicacion", usuarioController.getSimilarUsuarioByUbicacion);

    return router;
};
