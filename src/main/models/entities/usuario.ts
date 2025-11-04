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
}
