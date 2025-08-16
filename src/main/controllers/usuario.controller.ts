import { Request, Response } from "express";
import { UsuarioService } from "@services/usuario.service";
import { asyncHandler, ValidationError } from "../middlewares/error.middleware";
import { BaseController } from "./base.controller";

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
        if (!id) throw new ValidationError('ID de usuario es requerido');
        const usuario = await this.usuarioService.findById(id);
        return this.sendSuccess(res, 200, usuario, 'Usuario encontrado exitosamente');
    });

    createUsuario = asyncHandler(async (req: Request, res: Response) => {
        const usuarioData = req.body;
        const nuevoUsuario = await this.usuarioService.create(usuarioData);
        return this.sendSuccess(res, 201, nuevoUsuario, 'Usuario creado correctamente');
    });

    updateUsuario = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const usuarioData = req.body;
        if (!id) throw new ValidationError('ID de usuario es requerido');
        const usuarioActualizado = await this.usuarioService.update(id, usuarioData);
        return this.sendSuccess(res, 200, usuarioActualizado, 'Usuario actualizado correctamente');
    });

    deleteUsuario = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new ValidationError('ID de usuario es requerido');
        const resultado = await this.usuarioService.delete(id);
        return this.sendSuccess(res, 200, resultado, 'Usuario eliminado correctamente');
    });
}
