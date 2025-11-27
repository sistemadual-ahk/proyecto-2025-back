import { NotFoundError } from "../middlewares/error.middleware";
import { RepositorioDeProfesiones } from "@models/repositories/repositorioDeProfesiones";
import { Profesion } from "@models/entities/profesion";

export class ProfesionService {
    constructor(private profesionRepository: RepositorioDeProfesiones) {}
    async findAll() {
        const profesiones = await this.profesionRepository.findAll();
        return profesiones.map((p) => this.toDTO(p));
    }
    async findById(id: string) {
        const profesion = await this.profesionRepository.findById(id);
        if (!profesion) throw new NotFoundError(`Profesión con id ${id} no encontrada`);
        return this.toDTO(profesion);
    }
    private toDTO(profesion: Profesion) {
        return {
            id: profesion.id,
            nombre: profesion.nombre,
        };
    }
}
