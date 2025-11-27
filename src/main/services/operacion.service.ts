import { Operacion } from "@models/entities/operacion";
import { RepositorioDeOperaciones } from "@models/repositories/repositorioDeOperaciones";
import {
  ValidationError,
  NotFoundError,
} from "../middlewares/error.middleware";
import {
  RepositorioDeBilleteras,
  RepositorioDeCategorias,
  RepositorioDeUsuarios,
} from "@models/repositories";
import { RepositorioDeObjetivos } from "@models/repositories/repositorioDeObjetivos";
import { EstadoObjetivo } from "@models/entities/objetivo";

type OperacionInputData = {
  monto: number;
  tipo: string;
  billeteraId: string;
  categoriaId: string;
  user?: string;
  descripcion?: string;
  fecha?: Date;
  objetivo?: string; // id de objetivo
};

export class OperacionService {
  constructor(
    private operacionRepository: RepositorioDeOperaciones,
    private categoriaRepository: RepositorioDeCategorias,
    private billeteraRepository: RepositorioDeBilleteras,
    private userRepository: RepositorioDeUsuarios,
    private objetivoRepository: RepositorioDeObjetivos
  ) {}

  // ----------------------------------------------------------------------
  // MÉTODOS FILTRADOS POR USUARIO
  // ----------------------------------------------------------------------

  async findAllForUser(userId: string) {
    const operaciones = await this.operacionRepository.findAllByUserId(userId);
    return operaciones.map((o) => this.toDTO(o));
  }

  async findAllEgresosForUser(userId: string) {
    const operaciones = await this.operacionRepository.findByTipoAndUserId(
      "Egreso",
      userId
    );
    return operaciones.map((o) => this.toDTO(o));
  }

  async findAllIngresosForUser(userId: string) {
    const operaciones = await this.operacionRepository.findByTipoAndUserId(
      "Ingreso",
      userId
    );
    return operaciones.map((o) => this.toDTO(o));
  }

  // ----------------------------------------------------------------------
  // FILTROS
  // ----------------------------------------------------------------------

  async findByFilters(filters: {
    userId?: string;
    tipo?: string;
    categoriaId?: string;
    billeteraId?: string;
    desde?: string;
    hasta?: string;
  }) {
    const { userId, tipo, categoriaId, billeteraId, desde, hasta } = filters;

    const parsedDesde = desde ? new Date(desde) : undefined;
    const parsedHasta = hasta ? new Date(hasta) : undefined;

    const operaciones = await this.operacionRepository.findByFilters({
      userId,
      tipo,
      categoriaId,
      billeteraId,
      desde: parsedDesde,
      hasta: parsedHasta,
    });
    return operaciones.map((o) => this.toDTO(o));
  }

  async findById(id: string, userId: string) {
    const operacion = await this.operacionRepository.findById(id);
    if (
      !operacion ||
      !(operacion.user as any)?._id ||
      (operacion.user as any)._id.toString() !== userId
    ) {
      throw new NotFoundError(`Operacion con id ${id} no encontrada`);
    }
    return this.toDTO(operacion);
  }

  // ----------------------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------------------

  async create(operacionData: OperacionInputData) {
    const {
      descripcion,
      monto,
      tipo,
      fecha,
      billeteraId,
      categoriaId,
      user,
      objetivo,
    } = operacionData;

    if (!monto || !tipo || !user || !billeteraId || !categoriaId) {
      throw new ValidationError(
        "Monto, tipo, usuario, billeteraId y categoriaId son requeridos"
      );
    }
    if (monto === 0) {
      throw new ValidationError("El monto de la operacion no debe ser 0");
    }

    let tipoFinal: string;
    if (tipo.toLowerCase() === "income" || tipo.toLowerCase() === "ingreso") {
      tipoFinal = "Ingreso";
    } else if (
      tipo.toLowerCase() === "expense" ||
      tipo.toLowerCase() === "egreso"
    ) {
      tipoFinal = "Egreso";
    } else {
      throw new ValidationError(`El tipo de operacion '${tipo}' no es válido.`);
    }

    const billeteraRecuperada = await this.billeteraRepository.findById(
      billeteraId as string
    );
    if (!billeteraRecuperada)
      throw new NotFoundError(
        `Billetera con ID ${billeteraId} no encontrada`
      );

    const categoriaRecuperada = await this.categoriaRepository.findById(
      categoriaId as string
    );
    if (!categoriaRecuperada)
      throw new NotFoundError(
        `Categoria con ID ${categoriaId} no encontrada`
      );

    const usuarioRecuperado = await this.userRepository.findById(user);
    if (!usuarioRecuperado)
      throw new NotFoundError(`Usuario con ID ${user} no encontrado`);

    // Validar objetivo (si viene) y que sea del usuario
    if (objetivo) {
      const objetivoRecuperado = await this.objetivoRepository.findByIdAndUser(
        objetivo,
        user
      );
      if (!objetivoRecuperado) {
        throw new ValidationError(
          "El objetivo no existe o no pertenece al usuario"
        );
      }
    }

    const nuevaOperacion = new Operacion();
    nuevaOperacion.monto = monto;
    nuevaOperacion.descripcion = descripcion;
    nuevaOperacion.fecha = fecha || new Date();
    nuevaOperacion.tipo = tipoFinal as any;

    nuevaOperacion.billetera = billeteraRecuperada;
    nuevaOperacion.categoria = categoriaRecuperada;
    nuevaOperacion.user = usuarioRecuperado;
    nuevaOperacion.objetivo = objetivo || undefined;

    const operacionGuardada = await this.operacionRepository.save(
      nuevaOperacion
    );

    const billeteraAActualizar = billeteraRecuperada;

    if (tipoFinal === "Ingreso") {
      billeteraAActualizar.ingresoHistorico += monto;
    } else if (tipoFinal === "Egreso") {
      billeteraAActualizar.gastoHistorico += monto;
    }
    billeteraAActualizar.balance =
      billeteraAActualizar.balance +
      (tipoFinal === "Ingreso" ? monto : -monto);

    await this.billeteraRepository.save(billeteraAActualizar);

    // Recalcular objetivo si corresponde
    if (objetivo) {
      await this.recalcularObjetivo(objetivo, user);
    }

    return this.toDTO(operacionGuardada);
  }

  // ----------------------------------------------------------------------
  // UPDATE y DELETE
  // ----------------------------------------------------------------------

  async update(
    id: string,
    operacionData: Partial<Operacion>,
    userId: string
  ) {
    const operacionExistente = await this.operacionRepository.findById(id);
    if (
      !operacionExistente ||
      !(operacionExistente.user as any)?._id ||
      (operacionExistente.user as any)._id.toString() !== userId
    ) {
      throw new NotFoundError(`Operacion con id ${id} no encontrada`);
    }

    const objetivoAnteriorId = operacionExistente.objetivo
      ? (operacionExistente.objetivo as any).toString()
      : null;

    const { descripcion, monto, fecha, tipo, objetivo } = operacionData as any;

    if (monto !== undefined && monto === 0) {
      throw new ValidationError("El monto de la operacion no debe ser 0");
    }

    const operacionActualizada: Partial<Operacion> = {
      id: id,
      monto: monto !== undefined ? monto : operacionExistente.monto,
      descripcion: descripcion || operacionExistente.descripcion,
      fecha: fecha || operacionExistente.fecha,
      tipo: tipo || operacionExistente.tipo,
      objetivo: objetivo !== undefined ? objetivo : operacionExistente.objetivo,
    };

    const resultado = await this.operacionRepository.save(operacionActualizada);

    const objetivoNuevoId = operacionActualizada.objetivo
      ? (operacionActualizada.objetivo as any).toString()
      : null;

    // Recalcular objetivos afectados
    if (objetivoAnteriorId && objetivoAnteriorId !== objetivoNuevoId) {
      await this.recalcularObjetivo(objetivoAnteriorId, userId);
    }
    if (objetivoNuevoId) {
      await this.recalcularObjetivo(objetivoNuevoId, userId);
    }

    return this.toDTO(resultado);
  }

  async delete(id: string, userId: string) {
    const operacion = await this.operacionRepository.findById(id);

    if (
      !operacion ||
      !(operacion.user as any)?._id ||
      (operacion.user as any)._id.toString() !== userId
    ) {
      throw new NotFoundError(`Operacion con id ${id} no encontrada`);
    }

    const objetivoId = operacion.objetivo
      ? (operacion.objetivo as any).toString()
      : null;

    const deleted = await this.operacionRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError(
        `Operacion con id ${id} no se pudo eliminar`
      );
    }

    if (objetivoId) {
      await this.recalcularObjetivo(objetivoId, userId);
    }

    return { success: true, message: "Operacion eliminada correctamente" };
  }

  // ----------------------------------------------------------------------
  // LÓGICA DE OBJETIVOS
  // ----------------------------------------------------------------------

  private async recalcularObjetivo(objetivoId: string, userId: string) {
    const objetivo = await this.objetivoRepository.findByIdAndUser(
      objetivoId,
      userId
    );
    if (!objetivo) return;

    const total = await this.operacionRepository.calcularMontoTotalPorObjetivo(
      objetivoId,
      userId
    );

    let nuevoEstado = objetivo.estado;
    if (nuevoEstado !== EstadoObjetivo.CANCELADO) {
      nuevoEstado =
        total >= objetivo.montoObjetivo
          ? EstadoObjetivo.COMPLETADO
          : EstadoObjetivo.PENDIENTE;
    }

    await this.objetivoRepository.updateMontoYEstado(
      objetivoId,
      total,
      nuevoEstado
    );
  }

  // ----------------------------------------------------------------------
  // DTO MAPPING
  // ----------------------------------------------------------------------

  private toDTO(operacion: Operacion) {
    return {
      id: operacion.id || (operacion as any)._id,
      descripcion: operacion.descripcion,
      monto: operacion.monto,
      categoria: operacion.categoria,
      billetera: operacion.billetera,
      fecha: operacion.fecha,
      tipo: operacion.tipo,
      objetivo: operacion.objetivo,
      user: operacion.user
        ? {
            id: (operacion.user as any)._id,
            nombre: (operacion.user as any).nombre,
            email: (operacion.user as any).email,
          }
        : null,
    };
  }
}
