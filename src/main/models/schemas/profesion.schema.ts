import mongoose from "mongoose";

const profesionSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
        collection: "profesiones",
    }
);

export const ProfesionModel = mongoose.model("Profesion", profesionSchema);
