import { Router } from "express";
import { UsuarioController } from "@controllers/usuario.controller";
import { syncUser } from "@middlewares/sync-user.middleware";
import { checkJwt } from "@middlewares/auth.middleware";

export const createUsuarioRoutes = (usuarioController: UsuarioController): Router => {
    const router = Router();

    router.get("/", usuarioController.getAllUsuarios);

    // endpoint para comparar usuarios (debe ir antes de /:id para evitar conflictos)
    // router.get("/comparar/:idUsuarioComparar", usuarioController.compararUsuarios);
    router.get("/comparar/", usuarioController.compararUsuarios);

    //* endpoint para comparacion directa con criterios
    router.post("/compararporcriterios", usuarioController.compararPorCriterios);

    // endpoint para similares (TESTING)
    router.get("/similar/sueldo", usuarioController.getSimilarUsuarioBySueldo);
    router.get("/similar/profesion", usuarioController.getSimilarUsuarioByProfesion);
    router.get("/similar/ubicacion", usuarioController.getSimilarUsuarioByUbicacion);
    router.get("/me", checkJwt, syncUser, usuarioController.getUsuarioActual);
    router.get("/:id", usuarioController.getUsuarioById);
    router.get("/:telegramId", usuarioController.getUsuarioByTelegramId);
    router.post("/", usuarioController.createUsuario);
    router.put("/:id", usuarioController.updateUsuario);
    router.delete("/:id", usuarioController.deleteUsuario);

    return router;
};
