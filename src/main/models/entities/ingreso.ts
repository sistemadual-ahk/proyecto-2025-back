import { Categoria } from "./categoria";
import { Moneda } from "./moneda";

export class Gasto {
    id: string;
    monto: number;
    moneda: Moneda;
    fecha: Date;
    descripcion: string;
    categoria: Categoria;
    billetera: Billetera;
    usuarioId: string;
}