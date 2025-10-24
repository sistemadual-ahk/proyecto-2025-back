import { OperacionModel } from "@models/schemas/operacion.schema";
import { Operacion } from '@models/entities/operacion';
import mongoose from 'mongoose'; // Necesario para Types.ObjectId

// Tipo para los filtros que recibe findByFilters
type OperacionFilters = {
    tipo?: string;
    categoriaId?: string;
    billeteraId?: string;
    desde?: Date;
    hasta?: Date;
};

export class RepositorioDeOperaciones {
    private model: typeof OperacionModel;

    constructor() {
        this.model = OperacionModel;
    }

    // --- MÉTODOS FILTRADOS POR USUARIO (AÑADIDOS) ---

    /**
     * Busca todas las operaciones para un usuario específico.
     */
    async findAllByUserId(userId: string): Promise<Operacion[]> {
        const operaciones = await this.model.find({ user: new mongoose.Types.ObjectId(userId) })
            .populate('categoria')
            .populate('billetera')
            .populate('user'); // Opcional, si quieres los datos del usuario poblados
        return operaciones as unknown as Operacion[];
    }

    /**
     * Busca operaciones por tipo Y usuario específico.
     */
    async findByTipoAndUserId(tipo: string, userId: string): Promise<Operacion[]> {
        const operaciones = await this.model.find({
            tipo: tipo,
            user: new mongoose.Types.ObjectId(userId)
        })
            .populate('categoria')
            .populate('billetera')
            .populate('user');
        return operaciones as unknown as Operacion[];
    }

    async findAll(): Promise<Operacion[]> {
        const operaciones = await this.model.find()
            .populate('categoria')
            .populate('billetera')
            .populate('user');
        return operaciones as unknown as Operacion[];
    }

    async findById(id: string): Promise<Operacion | null> {
        const operacion = await this.model.findById(id)
            .populate('categoria')
            .populate('billetera')
            .populate('user');
        return operacion as unknown as Operacion | null;
    }

    async findByTipo(tipo: string): Promise<Operacion[]> {
        const operaciones = await this.model.find({ tipo })
            .populate('categoria')
            .populate('billetera')
            .populate('user');
        return operaciones as unknown as Operacion[];
    }

    /**
    findByFilters recibe userId y lo añade a la query.
     */
    async findByFilters(userId: string, filters: OperacionFilters): Promise<Operacion[]> {
        const query: any = {
            user: new mongoose.Types.ObjectId(userId)
        };

        if (filters.tipo) {
            query.tipo = filters.tipo;
        }
        if (filters.categoriaId) {
            query.categoria = filters.categoriaId;
        }
        if (filters.billeteraId) {
            query.billetera = filters.billeteraId;
        }
        if (filters.desde || filters.hasta) {
            query.fecha = {};
            if (filters.desde) {
                query.fecha.$gte = filters.desde;
            }
            if (filters.hasta) {
                query.fecha.$lte = filters.hasta;
            }
        }

        const operaciones = await this.model.find(query)
            .populate('categoria')
            .populate('billetera')
            .populate('user');
        return operaciones as unknown as Operacion[];
    }

    async save(operacion: Partial<Operacion>): Promise<Operacion> {
        if (operacion.id) {
            const operacionActualizada = await this.model.findByIdAndUpdate(
                operacion.id,
                operacion,
                { new: true, runValidators: true }
            ).populate('categoria')
                .populate('billetera')
                .populate('user');
            return operacionActualizada as unknown as Operacion;
        } else {
            // Asegurarse de que las referencias sean ObjectId si tu schema lo requiere
            if (operacion.user && typeof operacion.user === 'string') {
                operacion.user = new mongoose.Types.UUID(operacion.user) as any;
            }
            if (operacion.billetera && typeof operacion.billetera === 'string') {
                operacion.billetera = new mongoose.Types.UUID(operacion.billetera) as any;
            }
            if (operacion.categoria && typeof operacion.categoria === 'string') {
                operacion.categoria = new mongoose.Types.UUID(operacion.categoria) as any;
            }

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