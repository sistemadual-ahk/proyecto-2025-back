import { Request, Response } from "express";
import { UsuarioService } from "@services/usuario.service";
import { asyncHandler, ValidationError } from "../middlewares/error.middleware";
import { BaseController } from "./base.controller";
// import { RequestWithAuth } from "@middlewares/sync-user.middleware";

export class UsuarioController extends BaseController {
    constructor(private usuarioService: UsuarioService) {
        super();
    }

    getAllUsuarios = asyncHandler(async (_req: Request, res: Response) => {
        const usuarios = await this.usuarioService.findAll();
        return this.sendSuccess(res, 200, usuarios);
    });

    getUsuarioById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new ValidationError("ID de usuario es requerido");
        const usuario = await this.usuarioService.findById(id);
        return this.sendSuccess(res, 200, usuario, "Usuario encontrado exitosamente");
    });

    getUsuarioByTelegramId = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new ValidationError("ID de usuario es requerido");
        const usuario = await this.usuarioService.findByTelegramId(id);
        return this.sendSuccess(res, 200, usuario, "Usuario encontrado exitosamente");
    });

    getSimilarUsuarioBySueldo = asyncHandler(async (req: Request, res: Response) => {
        const { sueldo, id, count } = req.query;
        const cantUsuarios = count ? Number(count) : 1;

        if (!sueldo || !id) throw new ValidationError("Sueldo y id es requerido");

        const usuario = await this.usuarioService.findSimilarBySueldo(Number(sueldo), String(id), cantUsuarios);
        return this.sendSuccess(res, 200, usuario, "Usuario similar encontrado exitosamente");
    });

    getSimilarUsuarioByProfesion = asyncHandler(async (req: Request, res: Response) => {
        const { profesion, id, count } = req.query;
        const cantUsuarios = count ? Number(count) : 1;

        if (!profesion || !id) throw new ValidationError("Profesion y id es requerido");
        const usuario = await this.usuarioService.findSimilarByProfesion(String(profesion), String(id), cantUsuarios);

        if (!usuario) throw new ValidationError("No se encontraron usuarios similares");
        return this.sendSuccess(res, 200, usuario, "Usuario similar encontrado exitosamente");
    });

    getSimilarUsuarioByUbicacion = asyncHandler(async (req: Request, res: Response) => {
        const { provincia, municipio, localidad, id, count, exactitud } = req.query;
        const cantUsuarios = count ? Number(count) : 1;

        if (!provincia || !municipio || !localidad || !id) {
            throw new ValidationError("Ubicación completa e ID son requeridos");
        }

        const ubicacion = {
            provincia: provincia as string,
            municipio: municipio as string,
            localidad: localidad as string,
        };

        const usuario = await this.usuarioService.findSimilarByUbicacion(ubicacion, String(id), cantUsuarios, String(exactitud));

        return this.sendSuccess(res, 200, usuario, "Usuario similar encontrado exitosamente");
    });

    createUsuario = asyncHandler(async (req: Request, res: Response) => {
        const usuarioData = req.body;
        const nuevoUsuario = await this.usuarioService.create(usuarioData);
        return this.sendSuccess(res, 201, nuevoUsuario, "Usuario creado correctamente");
    });

    updateUsuario = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const usuarioData = req.body;
        if (!id) throw new ValidationError("ID de usuario es requerido");
        const usuarioActualizado = await this.usuarioService.update(id, usuarioData);
        return this.sendSuccess(res, 200, usuarioActualizado, "Usuario actualizado correctamente");
    });

    deleteUsuario = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new ValidationError("ID de usuario es requerido");
        const resultado = await this.usuarioService.delete(id);
        return this.sendSuccess(res, 200, resultado, "Usuario eliminado correctamente");
    });
}
