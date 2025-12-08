export class Usuario {
    auth0Id: string;
    id: string;
    _id?: string;
    telegramId: string;
    name: string;
    phoneNumber: number;
    mail: string;
    password: string | null;
    ubicacion?: {
        provincia?: string | null;
        municipio?: string | null;
        localidad?: string | null;
    };
    situacionLaboral?: string | null;
    sueldo?: number | null;
    profesion?: string | null;
    estadoCivil?: string | null;
}

export class UsuarioWithMatchBy extends Usuario {
    matchBy: "provincia" | "municipio" | "localidad";
}

// clase para solo usar datos de comparacion, sin datos personales
export interface UsuarioComparacion {
    id: string;
    sueldo?: number;
    profesion?: string;
    ubicacion?: {
        provincia?: string | null;
        municipio?: string | null;
        localidad?: string | null;
    };
    score: number;
}
