import mongoose from "mongoose";
import { Provincia } from "../../entities/ubicacion/provincia";

const provinciaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    poblacion: {
        type: Number,
        required: false,
    },
    municipios: [
        {
            nombre: {
                type: String,
                required: true,
            },
            localidades: [
                {
                    nombre: {
                        type: String,
                        required: true,
                    },
                },
            ],
        },
    ],
});

provinciaSchema.loadClass(Provincia);

export const ProvinciaModel = mongoose.model("Ubicacion", provinciaSchema);
