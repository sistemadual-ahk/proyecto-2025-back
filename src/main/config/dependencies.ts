import { RepositorioDeCategorias } from "../models/repositories/repositorioDeCategorias";
import { CategoriaService } from "../services/categoria.service";
import { CategoriaController } from "../controllers/categoria.controller";

// Repositorios
export const categoriaRepo = new RepositorioDeCategorias();

// Servicios
export const categoriaService = new CategoriaService(categoriaRepo);

// Controladores
export const categoriaController = new CategoriaController(categoriaService); 