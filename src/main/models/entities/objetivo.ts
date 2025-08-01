<<<<<<< HEAD


export class Objetivo {
    id: string;
    monto: number;
    titulo: string;
    categoria: Categoria;
    fechaInicio: Date;
    fechaEsperadaFinalizacion: Date;
    fechaFin: Date;
}
=======
import { Moneda } from "./moneda";

export class Objetivo {
    id: string;
    nombre: string;
    descripcion: string;
    montoObjetivo: number;
    montoActual: number;
    moneda: Moneda;
    fechaLimite: Date;
    usuarioId: string;
    activo: boolean;
}
>>>>>>> d2d049119bef094318f8a85a42c553a22bc882d8
