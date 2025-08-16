import { Objetivo } from "../models/entities/objetivo";
import { RepositorioDeObjetivos } from "@models/repositories/repositorioDeObjetivos";
import { ValidationError, NotFoundError } from "../middlewares/error.middleware";

export class ObjetivoService {
    constructor(private objetivoRepository: RepositorioDeObjetivos) {}

    async findAll() {
        const objetivos = await this.objetivoRepository.findAll();
        return objetivos.map(o => this.toDTO(o));
    }

    async findById(id: string) {
        const objetivo = await this.objetivoRepository.findById(id);
        if (!objetivo) throw new NotFoundError(`Objetivo con id ${id} no encontrado`);
        return this.toDTO(objetivo);
    }

    async create(objetivoData: Partial<Objetivo>) {
        const { titulo, montoObjetivo, categoria, fechaInicio, fechaEsperadaFinalizacion } = objetivoData;
        if (!titulo || !montoObjetivo || !categoria || !fechaInicio || !fechaEsperadaFinalizacion) {
            throw new ValidationError('Todos los campos obligatorios deben estar completos');
        }

        const nuevoObjetivo = new Objetivo();
        nuevoObjetivo.titulo = titulo;
        nuevoObjetivo.montoObjetivo = montoObjetivo;
        nuevoObjetivo.montoActual = 0;
        nuevoObjetivo.categoria = categoria;
        nuevoObjetivo.fechaInicio = fechaInicio;
        nuevoObjetivo.fechaEsperadaFinalizacion = fechaEsperadaFinalizacion;
        nuevoObjetivo.fechaFin = objetivoData.fechaFin || null;

        const guardado = await this.objetivoRepository.save(nuevoObjetivo);
        return this.toDTO(guardado);
    }

    async update(id: string, objetivoData: Partial<Objetivo>) {
        const objetivoExistente = await this.objetivoRepository.findById(id);
        if (!objetivoExistente) throw new NotFoundError(`Objetivo con id ${id} no encontrado`);

        const actualizado = {
            ...objetivoExistente,
            titulo: objetivoData.titulo || objetivoExistente.titulo,
            montoObjetivo: objetivoData.montoObjetivo || objetivoExistente.montoObjetivo,
            categoria: objetivoData.categoria || objetivoExistente.categoria,
            fechaInicio: objetivoData.fechaInicio || objetivoExistente.fechaInicio,
            fechaEsperadaFinalizacion: objetivoData.fechaEsperadaFinalizacion || objetivoExistente.fechaEsperadaFinalizacion,
            fechaFin: objetivoData.fechaFin || objetivoExistente.fechaFin,
            montoActual: objetivoData.montoActual || objetivoExistente.montoActual
        };

        const resultado = await this.objetivoRepository.save(actualizado);
        return this.toDTO(resultado);
    }

    async delete(id: string) {
        const deleted = await this.objetivoRepository.deleteById(id);
        if (!deleted) throw new NotFoundError(`Objetivo con id ${id} no encontrado`);
        return { success: true, message: 'Objetivo eliminado correctamente' };
    }

    private toDTO(objetivo: Objetivo) {
        return {
            id: objetivo.id || (objetivo as any)._id,
            titulo: objetivo.titulo,
            montoObjetivo: objetivo.montoObjetivo,
            montoActual: objetivo.montoActual,
            categoria: objetivo.categoria,
            fechaInicio: objetivo.fechaInicio,
            fechaEsperadaFinalizacion: objetivo.fechaEsperadaFinalizacion,
            fechaFin: objetivo.fechaFin
        };
    }
}
