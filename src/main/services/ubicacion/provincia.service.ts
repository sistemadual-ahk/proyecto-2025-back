import { Provincia } from "@models/entities/ubicacion/provincia";
import { RepositorioDeProvincias } from "@models/repositories";

export class ProvinciaService {
    // TODO
    constructor(private provinciaRepository: RepositorioDeProvincias) {}

    async findAll() {
        const provincias = await this.provinciaRepository.findAll();
        return provincias.map((p) => this.toDTO(p));
    }

    async verificarUbicacionCompleta(
        provincia: string,
        municipio: string,
        localidad: string
    ): Promise<{
        exists: boolean;
        provincia?: string;
        municipio?: string;
        localidad?: string;
    }> {
        return this.provinciaRepository.exists(provincia, municipio, localidad);
    }

    private toDTO(provincia: Provincia) {
        // no manejamos ID
        return {
            nombre: provincia.nombre,
            poblacion: provincia.poblacion,
            municipios: provincia.municipios?.map((municipio) => ({
                nombre: municipio.nombre,
                localidades: municipio.localidades?.map((localidad) => ({
                    nombre: localidad.nombre,
                })),
            })),
        };
    }
}
