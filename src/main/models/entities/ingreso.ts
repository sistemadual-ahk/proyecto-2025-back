import { Categoria } from './categoria';
import { Billetera } from './billetera';
import { Usuario } from './Usuario';

export class Ingreso {
    id: string;
    descripcion: string;
    monto: number;
    categoria: Categoria;
    billetera: Billetera;
    fecha: Date;
    user: Usuario
}
