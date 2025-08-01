import { Categoria } from "./categoria";

export class Gasto {
    id!: string;
    descripcion!: string;
    monto!: number;
    categoria!: Categoria;
    fecha!: Date;
    usuarioId!: string;
}