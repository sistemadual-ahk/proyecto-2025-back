import { Request, Response } from "express";
import { UsuarioService } from "@services/usuario.service";
import { asyncHandler, ValidationError } from "../middlewares/error.middleware";
import { BaseController } from "./base.controller";
import { RequestWithAuth } from "@middlewares/sync-user.middleware";

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

    getUsuarioActual = asyncHandler(async (req: RequestWithAuth, res: Response) => {
        const authId = req.dbUser?.sub; // viene del token si usás Auth0
        if (!authId) throw new ValidationError("Usuario no autenticado");

        const usuario = await this.usuarioService.findByAuthId(authId);
        return this.sendSuccess(res, 200, usuario, "Usuario actual obtenido exitosamente");
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
        const exactitudValue = exactitud ? String(exactitud) : "provincia";

        if (!provincia || !municipio || !localidad || !id) {
            throw new ValidationError("Ubicación completa e ID son requeridos");
        }

        const ubicacion = {
            provincia: provincia as string,
            municipio: municipio as string,
            localidad: localidad as string,
        };

        const usuario = await this.usuarioService.findSimilarByUbicacion(ubicacion, String(id), cantUsuarios, exactitudValue);

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

    compararUsuarios = asyncHandler(async (req: RequestWithAuth, res: Response) => {
        const usuarioActualId = req.dbUser?.id || (req.dbUser as any)?._id?.toString();
        if (!usuarioActualId) {
            throw new ValidationError("No se pudo determinar el usuario actual desde el token de autenticación");
        }

        const { idUsuarioComparar } = req.params;
        if (!idUsuarioComparar) {
            throw new ValidationError("ID del usuario a comparar es requerido");
        }

        // Obtener mes y año de query params (opcional, por defecto mes actual)
        // Soporta tanto "año" como "anio" para evitar problemas con caracteres especiales en URLs
        const mesParam = req.query['mes'] || req.query['month'];
        const añoParam = req.query['año'] || req.query['anio'] || req.query['year'];

        const mes = mesParam ? Number(mesParam) : undefined;
        const año = añoParam ? Number(añoParam) : undefined;

        // Validar que mes y año sean válidos si se proporcionan
        if (mes !== undefined) {
            if (isNaN(mes) || mes < 1 || mes > 12) {
                throw new ValidationError("El mes debe ser un número entre 1 y 12");
            }
        }
        if (año !== undefined) {
            if (isNaN(año) || año < 2000 || año > 2100) {
                throw new ValidationError("El año debe ser un número válido entre 2000 y 2100");
            }
        }

        const comparacion = await this.usuarioService.compararUsuarios(
            usuarioActualId.toString(),
            idUsuarioComparar,
            mes,
            año
        );

        return this.sendSuccess(res, 200, comparacion, "Comparación de usuarios realizada exitosamente");
    });
}
