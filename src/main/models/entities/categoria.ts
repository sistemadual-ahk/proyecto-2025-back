import { Usuario } from "./Usuario";

export class Categoria {
  constructor(
    public id: string,
    public nombre: string,
    public descripcion: string,
    public icono: string,
    public color: string,
    public user: Usuario
  ) {}
}