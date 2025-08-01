import { Categoria } from "./categoria";

export class Ingreso {
    id: string;
    descripcion: string;
    monto: number;
    categoria: Categoria;
    fecha: Date;
    usuarioId: string;
}