import mongoose from 'mongoose';
import { Categoria } from '../entities/categoria';

const categoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v: string) {
        return v.length >= 2;
      },
      message: 'El nombre debe tener al menos 2 caracteres'
    }
  },
  descripcion: {
    type: String,
    trim: true,
    default: ''
  },
  icono: {
    type: String,
    trim: true,
    default: ''
  },
  color: {
    type: String,
    trim: true,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'categorias'
});

categoriaSchema.loadClass(Categoria);

export const CategoriaModel = mongoose.model('Categoria', categoriaSchema);