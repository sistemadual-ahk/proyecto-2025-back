import { OperacionModel } from "@models/schemas/operacion.schema";
import { Operacion } from '@models/entities/operacion';

export class RepositorioDeOperaciones {
    private model: typeof OperacionModel;
    
    constructor() {
        this.model = OperacionModel;
    }
  
    async findAll(): Promise<Operacion[]> {
        const operaciones = await this.model.find();
        return operaciones as unknown as Operacion[];
    }
  
    async findById(id: string): Promise<Operacion | null> {
        const operacion = await this.model.findById(id);
        return operacion as unknown as Operacion | null;
    }
  
    async findByName(nombre: string): Promise<Operacion | null> {
        const operacion = await this.model.findOne({ nombre });
        return operacion as unknown as Operacion | null;
    }
  
    async save(operacion: Partial<Operacion>): Promise<Operacion> {
        if (operacion.id) {
            const operacionActualizada = await this.model.findByIdAndUpdate(
                operacion.id,
                operacion,
                { new: true, runValidators: true }
            );
            return operacionActualizada as unknown as Operacion;
        } else {
            const nuevaOperacion = new this.model(operacion);
            const operacionGuardada = await nuevaOperacion.save();
            return operacionGuardada as unknown as Operacion;
        }
    }
  
    async deleteById(id: string): Promise<boolean> {
        const resultado = await this.model.findByIdAndDelete(id);
        return resultado !== null;
    }
}
