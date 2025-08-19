import mongoose from 'mongoose';
import { Objetivo } from '../entities/objetivo';

const objetivoSchema = new mongoose.Schema({
  montoObjetivo: {
  type: Number,
  required: true,
  min: 0.01
  },
  montoActual: {
  type: Number,
  default: 0,
  min: 0
  },
  titulo: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: true
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaEsperadaFinalizacion: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'objetivos'
});

objetivoSchema.loadClass(Objetivo);

export const ObjetivoModel = mongoose.model('Objetivo', objetivoSchema);
