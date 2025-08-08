import mongoose from 'mongoose';
import { Operacion } from '@models/entities/operacion';
import { TipoOperacion } from '@models/entities/tipoOperacion';
import { ref } from 'process';

const OperacionSchema = new mongoose.Schema({
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
    required: true,
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
  },
  tipo: {
      type: String,
      enum: Object.values(TipoOperacion),
      required: true
    }
}, {
  timestamps: true,
  collection: 'Operaciones'
});

OperacionSchema.loadClass(Operacion);

export const OperacionModel = mongoose.model('Operacion', OperacionSchema);