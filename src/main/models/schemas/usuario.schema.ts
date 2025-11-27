import mongoose from "mongoose";
import { Usuario } from "../entities/usuario";

const usuarioSchema = new mongoose.Schema(
    {
        auth0Id: {
            type: String,
            required: true,
            unique: true,
        },
        telegramId: {
            type: String,
            required: false,
            unique: true,
        },
        name: {
            type: String,
            required: false,
            trim: true,
            minlength: 2,
        },
        mail: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        phoneNumber: {
            type: String,
            required: false,
            trim: true,
        },
        password: {
            type: String,
            required: false,
        },
        ubicacion: {
            provincia: { type: String, required: false, trim: true },
            municipio: { type: String, required: false, trim: true },
            localidad: { type: String, required: false, trim: true },
        },
        sueldo: {
            type: Number,
            required: false,
            min: 0,
        },
        profesion: {
            type: String,
            required: false,
            trim: true,
        },
        estadoCivil: {
            type: String,
            required: false,
            trim: true,
        },
    },
    {
        timestamps: true,
        collection: "usuarios",
    }
);

usuarioSchema.loadClass(Usuario);

export const UsuarioModel = mongoose.model("Usuario", usuarioSchema);
