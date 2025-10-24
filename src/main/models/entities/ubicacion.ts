export class Ubicacion {
    provincia: [{
        nombre: string;
        poblacion: number;
        ciudad: [{
            nombre: string;
            municipio:[{
                nombre: string;
                localidad: [{
                    nombre: string;
                }]
            }]
        }]
    }]
}