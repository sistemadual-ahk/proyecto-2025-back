import { Usuario } from "./usuario";

export class Categoria {
    id: string;
    nombre: string;
    descripcion?: string;
    icono: string;
    color: string;
    user: Usuario | null;
    isDefault: boolean; //Puede ser que la filetiemos
}
