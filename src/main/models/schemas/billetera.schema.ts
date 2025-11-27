import mongoose from 'mongoose';
import { Moneda } from '../entities/moneda';
import { Billetera } from '../entities/billetera';

const billeteraSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  moneda: {
    type: String,
    enum: Object.values(Moneda)
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  color: {
    type: String,
    default: ''
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  gastoHistorico: {
    type: Number,
    required: true,
    default: 0
  },
  ingresoHistorico: {
    type: Number,
    required: true,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, {
  timestamps: true,
  collection: 'billeteras'
});

billeteraSchema.loadClass(Billetera);

export const BilleteraModel = mongoose.model('Billetera', billeteraSchema);
