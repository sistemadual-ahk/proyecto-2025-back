<<<<<<< HEAD


export class Billetera {
    id: string;
    moneda: Moneda;
    nombre: string;
    balance: number;
    balanceHistorico: number;
    tipo: TipoBilletera;
    color: string;
}
=======
import { Moneda } from "./moneda";

export class Billetera {
    id: string;
    nombre: string;
    saldo: number;
    moneda: Moneda;
    usuarioId: string;
    activa: boolean;
}
>>>>>>> d2d049119bef094318f8a85a42c553a22bc882d8
