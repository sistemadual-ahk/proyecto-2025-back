export class Usuario {
    auth0Id: string;
    id: string;
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
    sueldo?: number | null;
    profesion?: string | null;
    estadoCivil?: string | null;
}

export class UsuarioWithMatchBy extends Usuario {
    matchBy: "provincia" | "municipio" | "localidad";
}
