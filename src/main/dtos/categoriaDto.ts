import { UsuarioReferenciaDto } from './usuarioReferenciaDto'

export class CategoriaDto { 
    id: any;
    nombre: string;
    descripcion: string | undefined;
    icono: string;
    color: string;
    isDefault: boolean;
    
    user: UsuarioReferenciaDto | null; 
}