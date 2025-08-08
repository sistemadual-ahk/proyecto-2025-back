import { Categoria } from './categoria';

export class Objetivo {
   id: string;
   monto: number;
   titulo: string;
   categoria: Categoria;
   fechaInicio: Date;
   fechaEsperadaFinalizacion: Date;
   fechaFin?: Date
}
