import { Provincia } from "@models/entities/ubicacion/provincia";
import { RepositorioDeProvincias } from "@models/repositories";

export class ProvinciaService {
    // TODO
    constructor(private provinciaRepository: RepositorioDeProvincias) {}

    async findAll() {
        const provincia = await this.provinciaRepository.findAll();
        return provincia.map((p) => this.toDTO(p));
    }

    // TODO
    private toDTO(provincia: Provincia) {
        // no id requested
        return {
            nombre: provincia.nombre,
            poblacion: provincia.poblacion,
            municipios: provincia.municipios?.map((mun) => ({
                nombre: mun.nombre,
                localidades: mun.localidades?.map((loc) => ({
                    nombre: loc.nombre,
                })),
            })),
        };
    }
}
