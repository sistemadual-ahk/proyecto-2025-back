import { Moneda } from './moneda';
import { Usuario } from './usuario';

export class Billetera {
    id: string;
    nombre: string;
    balance: number;
    gastoHistorico: number;
    ingresoHistorico: number;
    isDefault: boolean;
    //tipo: TipoBilletera; De momento no estimado por complejidad en su uso.
    color: string;
    user: Usuario;
    moneda: Moneda;
}