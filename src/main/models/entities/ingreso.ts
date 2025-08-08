import { Categoria } from './categoria';
import { Billetera } from './billetera';
import { Usuario } from './Usuario';

export class Ingreso {
  constructor(
    public id: string,
    public descripcion: string,
    public monto: number,
    public categoria: Categoria,
    public billetera: Billetera,
    public fecha: Date,
    public user: Usuario
  ) {}
}
