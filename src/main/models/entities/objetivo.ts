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
