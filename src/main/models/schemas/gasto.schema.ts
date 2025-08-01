import mongoose from 'mongoose';
import { Gasto } from '../entities/gasto';

const gastoSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v: string) {
                return v.length >= 3;
            },
            message: 'La descripción debe tener al menos 3 caracteres'
        }
    },
    monto: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function(v: number) {
                return v > 0;
            },
            message: 'El monto debe ser mayor a 0'
        }
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria',
        required: true
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    usuarioId: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true,
    collection: 'gastos'
});

gastoSchema.loadClass(Gasto);

export const GastoModel = mongoose.model('Gasto', gastoSchema);
