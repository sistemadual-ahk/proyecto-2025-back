import mongoose from 'mongoose';
import { Ingreso } from '../entities/ingreso';

const ingresoSchema = new mongoose.Schema({
  descripcion: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  monto: {
    type: Number,
    required: true,
    min: 0.01
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: true
  },
  billetera: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billetera',
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, {
  timestamps: true,
  collection: 'ingresos'
});

ingresoSchema.loadClass(Ingreso);

export const IngresoModel = mongoose.model('Ingreso', ingresoSchema);
