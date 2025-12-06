export interface CategoriaComparacionDto {
    categoriaId: string;
    nombre: string;
    montoTotal: number;
}

export interface ComparacionUsuarioDto {
    name?: string; // Solo para el usuario actual
    sueldo?: number | null;
    profesion?: string | null;
    estadoCivil?: string | null;
    ubicacion?: {
        provincia?: string | null;
        municipio?: string | null;
        localidad?: string | null;
    } | null;
    categorias: CategoriaComparacionDto[];
    totalOperaciones: number;
    primeraFechaMes?: Date | null;
    ultimaFechaMes?: Date | null;
}

export interface ComparacionUsuariosResponseDto {
    usuarios: ComparacionUsuarioDto[];
}

export interface CriteriosComparacionDTO {
    // si es null no se usa el criterio
    sueldo?: boolean;
    profesion?: string;
    ubicacion?: {
        provincia?: string;
        municipio?: string;
        localidad?: string;
    };
    mes?: number;
    año?: number;
}
