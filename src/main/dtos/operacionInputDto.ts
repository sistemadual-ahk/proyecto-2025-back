
import { TipoOperacion } from "@models/entities/tipoOperacion";

export class OperacionDto {
   descripcion?: string;
   monto: number;
   fecha: Date;
   categoriaId?: string;
   billeteraId?: string;
   tipo?: TipoOperacion;
}