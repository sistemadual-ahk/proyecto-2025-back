import { Categoria } from "../models/entities/categoria";
import { RepositorioDeCategorias } from "../models/repositories/repositorioDeCategorias";
import { ValidationError, ConflictError, NotFoundError } from "../middlewares/error.middleware";

export class CategoriaService {
    constructor(private categoriaRepository: RepositorioDeCategorias) {}

    async findAll() {
        const categorias = await this.categoriaRepository.findAll();
        return categorias.map(c => this.toDTO(c));
    }

    async findById(id: string) {
        const categoria = await this.categoriaRepository.findById(id);
        if (!categoria) {
            throw new NotFoundError(`Categoría con id ${id} no encontrada`);
        }
        return this.toDTO(categoria);
    }

    async create(categoriaData: Partial<Categoria>) {
        const { nombre, descripcion } = categoriaData;
        
        if (!nombre || nombre.trim().length === 0) {
            throw new ValidationError('El nombre de la categoría es requerido');
        }
    
        const existente = await this.categoriaRepository.findByName(nombre.trim());
        if (existente) {
            throw new ConflictError(`Ya existe una categoría con el nombre ${nombre}`);
        }
    
        const nuevaCategoria = new Categoria();
        nuevaCategoria.nombre = nombre.trim();
        nuevaCategoria.descripcion = descripcion?.trim() || '';
        
        const categoriaGuardada = await this.categoriaRepository.save(nuevaCategoria);
        return this.toDTO(categoriaGuardada);
    }

    async update(id: string, categoriaData: Partial<Categoria>) {
        const categoriaExistente = await this.categoriaRepository.findById(id);
        if (!categoriaExistente) {
            throw new NotFoundError(`Categoría con id ${id} no encontrada`);
        }

        const { nombre, descripcion } = categoriaData;
        
        if (nombre && nombre.trim().length === 0) {
            throw new ValidationError('El nombre de la categoría no puede estar vacío');
        }

        if (nombre && nombre !== categoriaExistente.nombre) {
            const existente = await this.categoriaRepository.findByName(nombre.trim());
            if (existente) {
                throw new ConflictError(`Ya existe una categoría con el nombre ${nombre}`);
            }
        }

        const categoriaActualizada = {
            ...categoriaExistente,
            nombre: nombre?.trim() || categoriaExistente.nombre,
            descripcion: descripcion?.trim() || categoriaExistente.descripcion
        };

        const resultado = await this.categoriaRepository.save(categoriaActualizada);
        return this.toDTO(resultado);
    }

    async delete(id: string) {
        const deleted = await this.categoriaRepository.deleteById(id);
        if (!deleted) {
            throw new NotFoundError(`Categoría con id ${id} no encontrada`);
        }
        return { success: true, message: 'Categoría eliminada correctamente' };
    }

    private toDTO(categoria: Categoria) {
        return {
            id: categoria.id || (categoria as any)._id,
            nombre: categoria.nombre,
            descripcion: categoria.descripcion
        };
    }
} 