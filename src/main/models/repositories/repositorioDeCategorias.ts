import { CategoriaModel } from '../schemas/categoria.schema';
import { Categoria } from '../entities/categoria';

export class RepositorioDeCategorias {
    private model: typeof CategoriaModel;
    
    constructor() {
        this.model = CategoriaModel;
    }
  
    async findAll(): Promise<Categoria[]> {
        const categorias = await this.model.find();
        return categorias as unknown as Categoria[];
    }
  
    async findById(id: string): Promise<Categoria | null> {
        const categoria = await this.model.findById(id);
        return categoria as unknown as Categoria | null;
    }
  
    async findByName(nombre: string): Promise<Categoria | null> {
        const categoria = await this.model.findOne({ nombre });
        return categoria as unknown as Categoria | null;
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
