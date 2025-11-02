import { ProvinciaModel } from "../../schemas/ubicacion/provincia.schema";
import { Provincia } from "../../entities/ubicacion/provincia";

export class RepositorioDeProvincias {
    private model: typeof ProvinciaModel;

    constructor() {
        this.model = ProvinciaModel;
    }

    async findAll(): Promise<Provincia[]> {
        const provincias = await this.model.find({}, { _id: 0, __v: 0 }); // Projection: sin id ni version
        return provincias as unknown as Provincia[];
    }
}
