import { Moneda } from './moneda';
import { TipoBilletera } from './tipoBilletera';
import { Usuario } from './Usuario';

export class Billetera {
    id: string;
    nombre: string;
    moneda: Moneda;
    balance: number;
    balanceHistorico: number;
    tipo: TipoBilletera;
    color: string;
    user: Usuario;
}