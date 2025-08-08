import { Usuario } from "./Usuario";

export class Categoria {
   id: string;
   nombre: string;
   descripcion: string;
   icono: string;
   color: string;
   user: Usuario | null;
   isDefault: boolean
}