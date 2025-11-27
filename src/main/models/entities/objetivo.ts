import { Billetera } from "./billetera";
import { Categoria } from "./categoria";

export enum EstadoObjetivo {
  PENDIENTE = "PENDIENTE",
  COMPLETADO = "COMPLETADO",
  CANCELADO = "CANCELADO",
}

export class Objetivo {
  id: string;
  montoObjetivo: number;
  montoActual: number;
  titulo: string;
  categoria: Categoria;
  billetera: Billetera;
  user: any; 

  fechaInicio: Date;
  fechaEsperadaFinalizacion: Date;
  fechaFin?: Date | null;

  estado: EstadoObjetivo;
}
