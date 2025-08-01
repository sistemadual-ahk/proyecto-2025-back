import mongoose from 'mongoose';
import { Categoria } from '../entities/categoria';

const categoriaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v: string) {
                return v.length >= 2;
            },
            message: 'El nombre debe tener al menos 2 caracteres'
        }
    },
    descripcion: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true,
    collection: 'categorias'
});

categoriaSchema.loadClass(Categoria);

export const CategoriaModel = mongoose.model('Categoria', categoriaSchema); 