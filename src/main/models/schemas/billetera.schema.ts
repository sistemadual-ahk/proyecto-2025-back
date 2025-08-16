import mongoose from 'mongoose';
import { Moneda } from '../entities/moneda';
import { TipoBilletera } from '../entities/tipoBilletera';
import { Billetera } from '../entities/billetera';

const billeteraSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  moneda: {
    type: String,
    enum: Object.values(Moneda),
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  balanceHistorico: {
    type: Number,
    required: true,
    default: 0
  },
  tipo: {
    type: String,
    enum: Object.values(TipoBilletera),
    required: true
  },
  color: {
    type: String,
    default: ''
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
