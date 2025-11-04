import { ProvinciaModel } from "../../schemas/ubicacion/provincia.schema";
import { Provincia } from "../../entities/ubicacion/provincia";
import { accentInsensitiveRegex } from "main/utils/regexAccent";

export class RepositorioDeProvincias {
    private model: typeof ProvinciaModel;

    constructor() {
        this.model = ProvinciaModel;
    }

    async findAll(): Promise<Provincia[]> {
        const provincias = await this.model.find({}, { _id: 0, __v: 0 }); // Projection: sin id ni version
        return provincias as unknown as Provincia[];
    }

    async exists(provincia: string, municipio: string, localidad: string): Promise<boolean> {
        const provinciaRegex = accentInsensitiveRegex(provincia);
        const municipioRegex = accentInsensitiveRegex(municipio);
        const localidadRegex = accentInsensitiveRegex(localidad);
        
        const result = await this.model.findOne({
            nombre: { $regex: provinciaRegex },
            municipios: {
                $elemMatch: {
                    nombre: { $regex: municipioRegex },
                    localidades: {
                        $elemMatch: {
                            nombre: { $regex: localidadRegex },
                        },
                    },
                },
            },
        });
        // operador para pasar a boolean
        console.log(result);
        return !!result;
    }
}
