import { Ubicacion } from "@models/entities/Ubicacion";
import { RepositorioDeBilleteras } from "@models/repositories";

export class UbicacionService {
    // TODO
    constructor(private ubicacionRepository: RepositorioDeUbicaciones) {}

    async findAll() {
        const ubicacion = await this.ubicacionRepository.findAll();
        return ubicacion.map(o => this.toDTO(o));
    }

    // TODO
    async create(ubicacionData: Partial<Ubicacion>) {
        const { provincia } = ubicacionData;
    }

    // TODO
    private toDTO(Ubicacion: Ubicacion) {}
}