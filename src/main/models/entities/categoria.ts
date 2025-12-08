import { Types } from "mongoose";
import { Usuario } from "./usuario";

export class Categoria {
    id: string;
    _id?: Types.ObjectId | string;
    nombre: string;
    descripcion?: string;
    icono: string;
    color: string;
    iconColor: string; // icon color
    user: Usuario | null;
    isDefault: boolean; // Puede ser que la filtremos
    type: "income" | "expense"; // tipo de categoría
}
