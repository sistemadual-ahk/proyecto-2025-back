import { Categoria } from "./categoria";
import { Moneda } from "./moneda";
import { Billetera } from "./billetera";

export class Ingreso {
    id: string;
    monto: number;
    moneda: Moneda;
    fecha: Date;
    descripcion: string;
    categoria: Categoria;
    billetera: Billetera;
    usuarioId: string;
}