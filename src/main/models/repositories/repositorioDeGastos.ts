import { GastoModel } from '../schemas/gasto.schema';
import { Gasto } from '../entities/gasto';

export class RepositorioDeGastos {
    private model: typeof GastoModel;
    
    constructor() {
        this.model = GastoModel;
    }
  
    async findAll(): Promise<Gasto[]> {
        const gastos = await this.model.find().populate('categoria');
        return gastos as unknown as Gasto[];
    }
  
    async findById(id: string): Promise<Gasto | null> {
        const gasto = await this.model.findById(id).populate('categoria');
        return gasto as unknown as Gasto | null;
    }
  
    async findByUsuarioId(usuarioId: string): Promise<Gasto[]> {
        const gastos = await this.model.find({ usuarioId }).populate('categoria');
        return gastos as unknown as Gasto[];
    }
  
    async findByCategoria(categoriaId: string): Promise<Gasto[]> {
        const gastos = await this.model.find({ categoria: categoriaId }).populate('categoria');
        return gastos as unknown as Gasto[];
    }
  
    async save(gasto: Partial<Gasto>): Promise<Gasto> {
        if (gasto.id) {
            const gastoActualizado = await this.model.findByIdAndUpdate(
                gasto.id,
                gasto,
                { new: true, runValidators: true }
            ).populate('categoria');
            return gastoActualizado as unknown as Gasto;
        } else {
            const nuevoGasto = new this.model(gasto);
            const gastoGuardado = await nuevoGasto.save();
            const gastoPoblado = await gastoGuardado.populate('categoria');
            return gastoPoblado as unknown as Gasto;
        }
    }
  
    async deleteById(id: string): Promise<boolean> {
        const resultado = await this.model.findByIdAndDelete(id);
        return resultado !== null;
    }
} 