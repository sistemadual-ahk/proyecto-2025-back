import { Profesion } from "@models/entities/profesion";
import { ProfesionModel } from "@models/schemas/profesion.schema";

export class RepositorioDeProfesiones {
    private model: typeof ProfesionModel;

    constructor() {
        this.model = ProfesionModel;
    }
    async findAll(): Promise<Profesion[]> {
        const profesiones = await this.model.find();
        return profesiones as unknown as Profesion[];
    }
    async findById(id: string): Promise<Profesion | null> {
        const profesion = await this.model.findById(id);
        return profesion as unknown as Profesion | null;
    }

    async save(profesion: Partial<Profesion>): Promise<Profesion> {
        if (profesion.id) {
            const profesionActualizada = await this.model.findByIdAndUpdate(profesion.id, profesion, { new: true, runValidators: true });
            return profesionActualizada as unknown as Profesion;
        } else {
            const nuevaProfesion = new this.model(profesion);
            const profesionGuardada = await nuevaProfesion.save();
            return profesionGuardada as unknown as Profesion;
        }
    }

    async deleteById(id: string): Promise<boolean> {
        const resultado = await this.model.findByIdAndDelete(id);
        return resultado !== null;
    }
}
