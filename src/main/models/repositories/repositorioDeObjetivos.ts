import { ObjetivoModel } from "@models/schemas/objetivo.schema";
import { Objetivo } from '../entities/objetivo';
import { Types } from 'mongoose';

export class RepositorioDeObjetivos {
    private model: typeof ObjetivoModel;

    constructor() {
        this.model = ObjetivoModel;
    }

    async findAll(userId: string): Promise<Objetivo[]> {
        const uid = new Types.ObjectId(userId);
        const objetivos = await this.model.find({ user: uid }).populate('user', 'name _id');
        return objetivos as unknown as Objetivo[];
    }

    async findById(id: string): Promise<Objetivo | null> {
        const objetivo = await this.model.findById(id).populate('categoria');
        return objetivo as unknown as Objetivo | null;
    }

    async findByCategoriaId(categoriaId: string): Promise<Objetivo[]> {
        const objetivos = await this.model.find({ categoria: categoriaId }).populate('categoria');
        return objetivos as unknown as Objetivo[];
    }

    async save(objetivo: Partial<Objetivo>): Promise<Objetivo> {
        if (objetivo.id) {
            const objetivoActualizado = await this.model.findByIdAndUpdate(
                objetivo.id,
                objetivo,
                { new: true, runValidators: true }
            ).populate('categoria');
            return objetivoActualizado as unknown as Objetivo;
        } else {
            const nuevoObjetivo = new this.model(objetivo);
            const objetivoGuardado = await nuevoObjetivo.save();
            return objetivoGuardado as unknown as Objetivo;
        }
    }

    async deleteById(id: string): Promise<boolean> {
        const resultado = await this.model.findByIdAndDelete(id);
        return resultado !== null;
    }
}
