import mongoose from 'mongoose';
import { Usuario } from '../entities/usuario';

const usuarioSchema = new mongoose.Schema({
  auth0Id:{
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  mail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'usuarios'
});

usuarioSchema.loadClass(Usuario);

export const UsuarioModel = mongoose.model('Usuario', usuarioSchema);
