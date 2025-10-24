import { Ubicacion } from '@models/entities/Ubicacion';
import mongoose from 'mongoose';

const ubicacionSchema = new mongoose.Schema({
    provincia: [{
        nombre: {
            type: String,
            required: true
        },
        poblacion: {
            type: Number,
            required: false
        },
        ciudad: [{
            nombre: {
                type: String,
                required: true
            },
            municipio: [{
                nombre: {
                    type: String,
                    required: true
                },
                localidad: [{
                    nombre: {    
                        type: String,
                        required: true,
                    }
                }]
            }]
        }]
    }]
})

ubicacionSchema.loadClass(Ubicacion);

export const ubicacionModel = mongoose.model('Ubicacion', ubicacionSchema);