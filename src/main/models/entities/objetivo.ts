import { Categoria } from "./categoria";


export class Objetivo {
    id: string;
    montoObjetivo: number;
    montoActual: number;
    titulo: string;
    categoria: Categoria;
    fechaInicio: Date;
    fechaEsperadaFinalizacion: Date;
    fechaFin: Date;
}
