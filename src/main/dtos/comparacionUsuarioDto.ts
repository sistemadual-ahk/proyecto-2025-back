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

