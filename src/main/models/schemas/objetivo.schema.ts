import mongoose from "mongoose";
import { Objetivo, EstadoObjetivo } from "../entities/objetivo";

const objetivoSchema = new mongoose.Schema(
  {
    montoObjetivo: {
      type: Number,
      required: true,
      min: 0.01,
    },
    montoActual: {
      type: Number,
      default: 0,
      min: -999999999999,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    fechaInicio: {
      type: Date,
      required: true,
    },
    fechaEsperadaFinalizacion: {
      type: Date,
      required: true,
    },
    fechaFin: {
      type: Date,
      default: null,
    },
    estado: {
      type: String,
      enum: Object.values(EstadoObjetivo),
      default: EstadoObjetivo.PENDIENTE,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "objetivos",
  }
);

objetivoSchema.loadClass(Objetivo);

export const ObjetivoModel = mongoose.model("Objetivo", objetivoSchema);
