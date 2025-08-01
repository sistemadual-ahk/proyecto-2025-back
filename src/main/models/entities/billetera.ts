import { Moneda } from "./moneda";

export class Billetera {
    id: string;
    nombre: string;
    saldo: number;
    moneda: Moneda;
    usuarioId: string;
    activa: boolean;
}
