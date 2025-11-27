import { Objetivo, EstadoObjetivo } from "@models/entities/objetivo";
import { RepositorioDeObjetivos } from "@models/repositories/repositorioDeObjetivos";
import {
  ValidationError,
  NotFoundError,
} from "../middlewares/error.middleware";
import {
  RepositorioDeUsuarios,
  RepositorioDeBilleteras,
  RepositorioDeCategorias,
} from "@models/repositories";
import { RepositorioDeOperaciones } from "@models/repositories/repositorioDeOperaciones";
import { Operacion } from "@models/entities/operacion";

type ObjetivoInputData = {
  titulo: string;
  montoObjetivo: number;
  categoriaId: string;
  billeteraId: string;
  fechaInicio: Date;
  fechaEsperadaFinalizacion: Date;
  fechaFin?: Date | null;
};

export class ObjetivoService {
  constructor(
    private objetivoRepository: RepositorioDeObjetivos,
    private userRepository: RepositorioDeUsuarios,
    private billeteraRepository: RepositorioDeBilleteras,
    private categoriaRepository: RepositorioDeCategorias,
    private operacionRepository: RepositorioDeOperaciones
  ) {}

  async findAll(userId: string) {
    const objetivos = await this.objetivoRepository.findAllByUserId(userId);
    return objetivos.map((o) => this.toDTO(o));
  }

  async findById(id: string, userId: string) {
    const objetivo = await this.objetivoRepository.findByIdAndUser(id, userId);
    if (!objetivo)
      throw new NotFoundError(
        `Objetivo con id ${id} no encontrado para este usuario`
      );

    const operaciones = await this.operacionRepository.findByObjetivoId(
      id,
      userId
    );

    return this.toDTO(objetivo, operaciones);
  }

  async create(objetivoData: Partial<ObjetivoInputData>, userID: string) {
    const {
      titulo,
      montoObjetivo,
      categoriaId,
      billeteraId,
      fechaInicio,
      fechaEsperadaFinalizacion,
      fechaFin,
    } = objetivoData;

    if (
      !titulo ||
      !montoObjetivo ||
      !categoriaId ||
      !billeteraId ||
      !fechaInicio ||
      !fechaEsperadaFinalizacion
    ) {
      throw new ValidationError(
        "titulo, montoObjetivo, categoriaId, billeteraId, fechaInicio y fechaEsperadaFinalizacion son obligatorios"
      );
    }

    const usuarioRecuperado = await this.userRepository.findById(userID);
    if (!usuarioRecuperado)
      throw new NotFoundError(`Usuario con ID ${userID} no encontrado`);

    const billeteraRecuperada = await this.billeteraRepository.findById(
      billeteraId as string
    );
    if (!billeteraRecuperada)
      throw new NotFoundError(
        `Billetera con ID ${billeteraId} no encontrada`
      );

    // Opcional: validar que la billetera pertenezca al usuario
    if (
      (billeteraRecuperada as any).user &&
      (billeteraRecuperada as any).user._id &&
      (billeteraRecuperada as any).user._id.toString() !== userID
    ) {
      throw new ValidationError(
        "La billetera no pertenece al usuario autenticado"
      );
    }

    const categoriaRecuperada = await this.categoriaRepository.findById(
      categoriaId as string
    );
    if (!categoriaRecuperada)
      throw new NotFoundError(
        `Categoria con ID ${categoriaId} no encontrada`
      );

    const nuevoObjetivo = new Objetivo();
    nuevoObjetivo.titulo = titulo;
    nuevoObjetivo.montoObjetivo = montoObjetivo;
    nuevoObjetivo.montoActual = 0;
    nuevoObjetivo.categoria = categoriaRecuperada;
    nuevoObjetivo.billetera = billeteraRecuperada;
    nuevoObjetivo.user = usuarioRecuperado;
    nuevoObjetivo.fechaInicio = fechaInicio;
    nuevoObjetivo.fechaEsperadaFinalizacion = fechaEsperadaFinalizacion;
    nuevoObjetivo.fechaFin = fechaFin || null;
    nuevoObjetivo.estado = EstadoObjetivo.PENDIENTE;

    const guardado = await this.objetivoRepository.save(nuevoObjetivo);
    return this.toDTO(guardado);
  }

  async update(id: string, objetivoData: Partial<Objetivo>, userId: string) {
    const objetivoExistente = await this.objetivoRepository.findByIdAndUser(
      id,
      userId
    );
    if (!objetivoExistente)
      throw new NotFoundError(
        `Objetivo con id ${id} no encontrado para este usuario`
      );

    const actualizado: Partial<Objetivo> = {
      id,
      titulo: objetivoData.titulo ?? objetivoExistente.titulo,
      montoObjetivo:
        objetivoData.montoObjetivo ?? objetivoExistente.montoObjetivo,
      categoria: objetivoData.categoria ?? objetivoExistente.categoria,
      billetera: objetivoData.billetera ?? objetivoExistente.billetera,
      fechaInicio: objetivoData.fechaInicio ?? objetivoExistente.fechaInicio,
      fechaEsperadaFinalizacion:
        objetivoData.fechaEsperadaFinalizacion ??
        objetivoExistente.fechaEsperadaFinalizacion,
      fechaFin: objetivoData.fechaFin ?? objetivoExistente.fechaFin,
      // montoActual se recalcula desde operaciones
      montoActual: objetivoExistente.montoActual,
      estado: objetivoData.estado ?? objetivoExistente.estado,
      user: objetivoExistente.user,
    };

    const resultado = await this.objetivoRepository.save(actualizado);

    // Recalcular montoActual y estado en función de las operaciones
    const total = await this.operacionRepository.calcularMontoTotalPorObjetivo(
      id,
      userId
    );

    let nuevoEstado = resultado.estado;
    if (nuevoEstado !== EstadoObjetivo.CANCELADO) {
      nuevoEstado =
        total >= resultado.montoObjetivo
          ? EstadoObjetivo.COMPLETADO
          : EstadoObjetivo.PENDIENTE;
    }

    const actualizadoConMonto =
      (await this.objetivoRepository.updateMontoYEstado(
        id,
        total,
        nuevoEstado
      )) ?? resultado;

    return this.toDTO(actualizadoConMonto);
  }

  async delete(id: string, userId: string) {
    const deleted = await this.objetivoRepository.deleteByIdAndUser(
      id,
      userId
    );
    if (!deleted)
      throw new NotFoundError(
        `Objetivo con id ${id} no encontrado para este usuario`
      );
    return { success: true, message: "Objetivo eliminado correctamente" };
  }

  private toDTO(objetivo: Objetivo, operaciones: Operacion[] = []) {
    return {
      id: objetivo.id || (objetivo as any)._id,
      titulo: objetivo.titulo,
      montoObjetivo: objetivo.montoObjetivo,
      montoActual: objetivo.montoActual,
      estado: objetivo.estado,
      categoria: objetivo.categoria,
      billetera: objetivo.billetera,
      fechaInicio: objetivo.fechaInicio,
      fechaEsperadaFinalizacion: objetivo.fechaEsperadaFinalizacion,
      fechaFin: objetivo.fechaFin,
      operaciones: operaciones.map((o) => ({
        id: o.id || (o as any)._id,
        descripcion: o.descripcion,
        monto: o.monto,
        fecha: o.fecha,
        tipo: o.tipo,
        categoria: o.categoria,
        billetera: o.billetera,
      })),
    };
  }
}
