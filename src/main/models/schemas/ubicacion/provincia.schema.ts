import mongoose from "mongoose";
import { Provincia } from "../../entities/ubicacion/provincia";

const provinciaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
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

export const ProvinciaModel = mongoose.model("Provincia", provinciaSchema, "provincias");