import { Categoria } from './categoria';

export class Objetivo {
  constructor(
    public id: string,
    public monto: number,
    public titulo: string,
    public categoria: Categoria,
    public fechaInicio: Date,
    public fechaEsperadaFinalizacion: Date,
    public fechaFin?: Date
  ) {}
}
