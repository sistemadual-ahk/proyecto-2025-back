import { Objetivo } from "../models/entities/objetivo";
import { RepositorioDeObjetivos } from "@models/repositories/repositorioDeObjetivos";
import { ValidationError, ConflictError, NotFoundError } from "../middlewares/error.middleware";
import { RepositorioDeUsuarios, RepositorioDeBilleteras, RepositorioDeCategorias } from "@models/repositories";


type ObjetivoInputData = {
    monto: number;
    titulo: string; // Recibimos 'income'/'expense'
    montoObjetivo: number; // Asumimos que viene el ID
    categoria: string; // Asumimos ue viene el ID
    fechaInicio?: Date;
    fechaFin?: Date;
    fechaEsperadaFinalizacion?: Date;
    billetera: string; // Asumimos ue viene el ID

};

export class ObjetivoService {
    constructor(private objetivoRepository: RepositorioDeObjetivos, private userRepository: RepositorioDeUsuarios, private billeteraRepository: RepositorioDeBilleteras, private categoriaRepository: RepositorioDeCategorias) {}

    async findAll(userId: string) {
        const objetivos = await this.objetivoRepository.findAll(userId);
        return objetivos.map(o => this.toDTO(o));
    }

    async findById(id: string) {
        const objetivo = await this.objetivoRepository.findById(id);
        if (!objetivo) throw new NotFoundError(`Objetivo con id ${id} no encontrado`);
        return this.toDTO(objetivo);
    }

    async create(objetivoData: Partial<ObjetivoInputData>, userID: string) {
        const { titulo, montoObjetivo, categoria, fechaInicio, fechaEsperadaFinalizacion, billetera } = objetivoData;
        if (!titulo || !montoObjetivo || !categoria || !fechaInicio || !fechaEsperadaFinalizacion || !billetera) {
            throw new ValidationError('Todos los campos obligatorios deben estar completos');
        }

        const billeteraRecuperada = await this.billeteraRepository.findById(billetera as string);
        if (!billeteraRecuperada) throw new NotFoundError(`Billetera con ID ${billetera} no encontrada`);

        const categoriaRecuperada = await this.categoriaRepository.findById(categoria as string);
        if (!categoriaRecuperada) throw new NotFoundError(`Categoria con ID ${categoria} no encontrada`);

        const nuevoObjetivo = new Objetivo();
        nuevoObjetivo.titulo = titulo;
        nuevoObjetivo.montoObjetivo = montoObjetivo;
        nuevoObjetivo.montoActual = 0;
        nuevoObjetivo.categoria = categoriaRecuperada;
        nuevoObjetivo.fechaInicio = fechaInicio;
        nuevoObjetivo.fechaEsperadaFinalizacion = fechaEsperadaFinalizacion;
        nuevoObjetivo.fechaFin = objetivoData.fechaFin || null;
        nuevoObjetivo.billetera = billeteraRecuperada;

        const guardado = await this.objetivoRepository.save(nuevoObjetivo);
        return this.toDTO(guardado);
    }

    async update(id: string, objetivoData: Partial<Objetivo>) {
        const objetivoExistente = await this.objetivoRepository.findById(id);
        if (!objetivoExistente) throw new NotFoundError(`Objetivo con id ${id} no encontrado`);

        const actualizado = {
            id: id,
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
