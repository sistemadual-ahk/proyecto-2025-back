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

    async exists(provincia: string, municipio: string, localidad: string): Promise<{ exists: boolean; provincia?: string; municipio?: string; localidad?: string }> {
        const provinciaRegex = accentInsensitiveRegex(provincia);
        const municipioRegex = accentInsensitiveRegex(municipio);
        const localidadRegex = accentInsensitiveRegex(localidad);

        const result = await this.model.aggregate([
            { $match: { nombre: { $regex: provinciaRegex } } },
            { $unwind: "$municipios" },
            { $unwind: "$municipios.localidades" },
            {
                $match: {
                    "municipios.nombre": { $regex: municipioRegex },
                    "municipios.localidades.nombre": { $regex: localidadRegex },
                },
            },
            {
                $project: {
                    _id: 0,
                    provincia: "$nombre",
                    municipio: "$municipios.nombre",
                    localidad: "$municipios.localidades.nombre",
                },
            },
            { $limit: 1 },
        ]);

        if (result.length === 0) {
            return { exists: false };
        }
        const match = result[0];
        console.log("r", result);
        return {
            exists: true,
            provincia: match.provincia,
            municipio: match.municipio,
            localidad: match.localidad,
        };
    }
}
