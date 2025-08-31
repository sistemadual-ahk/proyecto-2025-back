import { CategoriaModel } from '../schemas/categoria.schema';
import { Categoria } from '../entities/categoria';
import { Types } from 'mongoose';

export class RepositorioDeCategorias {
    private model: typeof CategoriaModel;
    
    constructor() {
        this.model = CategoriaModel;
    }
  
    async findAll(): Promise<Categoria[]> {
        const categorias = await this.model.find().populate('user', 'name _id');
        return categorias as unknown as Categoria[];
    }
  
    async findById(id: string): Promise<Categoria | null> {
        const categoria = await this.model.findById(id).populate('user', 'name _id');
        return categoria as unknown as Categoria | null;
    }
  
    async findByName(nombre: string): Promise<Categoria | null> {
        const categoria = await this.model.findOne({ nombre }).populate('user', 'name _id');
        return categoria as unknown as Categoria | null;
    }

    async findAllByUser(userId: string): Promise<Categoria[]> {
        const uid = new Types.ObjectId(userId);
        const categorias = await this.model.find({ user: uid }).populate('user', 'name _id');
        return categorias as unknown as Categoria[];
    }

    async findAllForUser(userId: string): Promise<Categoria[]> {
        const uid = new Types.ObjectId(userId);
        const categorias = await this.model.find({
            $or: [{ isDefault: true }, { user: uid }]
        }).populate('user', 'name _id');
        return categorias as unknown as Categoria[];
    }
  
    async save(categoria: Partial<Categoria>): Promise<Categoria> {
        if (categoria.id) {
            const categoriaActualizada = await this.model.findByIdAndUpdate(
                categoria.id,
                categoria,
                { new: true, runValidators: true }
            );
            return categoriaActualizada as unknown as Categoria;
        } else {
            const nuevaCategoria = new this.model(categoria);
            const categoriaGuardada = await nuevaCategoria.save();
            return categoriaGuardada as unknown as Categoria;
        }
    }
  
    async deleteById(id: string): Promise<boolean> {
        const resultado = await this.model.findByIdAndDelete(id);
        return resultado !== null;
    }
}
