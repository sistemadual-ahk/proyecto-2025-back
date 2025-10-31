import { Moneda } from './moneda';
import { TipoBilletera } from './tipoBilletera';
import { Usuario } from './usuario';

export class Billetera {
    id: string;
    nombre: string;
    moneda: Moneda;
    balance: number;
    balanceHistorico: number;
    //tipo: TipoBilletera; De momento no estimado por complejidad en su uso.
    color: string;
    user: Usuario;
}
