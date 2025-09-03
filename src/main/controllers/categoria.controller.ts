import { Request, Response } from "express";
import { CategoriaService } from "../services/categoria.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { BaseController } from "./base.controller";
import { ValidationError } from "../middlewares/error.middleware";

export class CategoriaController extends BaseController {
    constructor(private categoriaService: CategoriaService) {
        super();
    }

    getAllCategorias = asyncHandler(async (req: Request, res: Response) => {
        const categorias = await this.categoriaService.findAll();
        return this.sendSuccess(res, 200, categorias);
    });

    getCategoriaById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new ValidationError('ID de categoría es requerido');
        }
        const categoria = await this.categoriaService.findById(id);
        return this.sendSuccess(res, 200, categoria, 'Categoría encontrada exitosamente');
    });

    getAllCategoriasForUser = asyncHandler(async (req: Request, res: Response) => {
        const userID = "68a773848761e988c438351c";
        const categorias = await this.categoriaService.findAllForUser(userID);
        return this.sendSuccess(res, 200, categorias);
    });

    getCategoriaByUser = asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      if (!id) {
            throw new ValidationError('ID de usuario es requerido');
        }
      const categorias = await this.categoriaService.findAllByUser(id);
      return this.sendSuccess(res, 200, categorias);
    });

    createCategoria = asyncHandler(async (req: Request, res: Response) => {
        // userID hay que cambiarlo cando tengamos lo de AUTH 
        // porque recibiriamos a un ID de usuario que luego llamamos
        const userID = "68a773848761e988c438351c";
        const categoriaData = req.body;
        const nuevaCategoria = await this.categoriaService.create(categoriaData, userID);
        return this.sendSuccess(res, 201, nuevaCategoria, 'Categoría creada correctamente');
    });

    updateCategoria = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const categoriaData = req.body;
        if (!id) {
            throw new ValidationError('ID de categoría es requerido');
        }
        const categoriaActualizada = await this.categoriaService.update(id, categoriaData);
        return this.sendSuccess(res, 200, categoriaActualizada, 'Categoría actualizada correctamente');
    });

    deleteCategoria = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            throw new ValidationError('ID de categoría es requerido');
        }
        const resultado = await this.categoriaService.delete(id);
        return this.sendSuccess(res, 200, resultado, 'Categoría eliminada correctamente');
    });
} 