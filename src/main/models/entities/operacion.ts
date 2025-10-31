import { Categoria } from './categoria';
import { Billetera } from './billetera';
import { Usuario } from './usuario';
import { TipoOperacion } from './tipoOperacion';

export class Operacion {
   id: string;
   descripcion?: string;
   monto: number;
   categoria?: Categoria;
   billetera?: Billetera;
   fecha?: Date;
   tipo?: TipoOperacion;
   user?: Usuario
    nuevaOperacion: Billetera;
}