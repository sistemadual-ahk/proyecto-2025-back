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
  billeteraId?: string;
  categoriaId: string;
  user?: string;
  descripcion?: string;
  fecha?: Date;
  objetivo?: string; // id de objetivo
};

export interface AnalysisData {
  monthlyData: number[];
  monthlyCategories: string[];
  categoryData: number[];
  categoryLabels: string[];
  donutData: number[];
  donutLabels: string[];
  incomeData: number[];
  expensesData: number[];
  periodCategories: string[];
}

export type AnalysisPeriod = 'weekly' | 'monthly' | 'annual';

export class OperacionService {
  constructor(
    private operacionRepository: RepositorioDeOperaciones,
    private categoriaRepository: RepositorioDeCategorias,
    private billeteraRepository: RepositorioDeBilleteras,
    private userRepository: RepositorioDeUsuarios,
    private objetivoRepository: RepositorioDeObjetivos,
  ) { }

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

    // billeteraId deja de ser siempre obligatorio
    if (!monto || !tipo || !user || !categoriaId) {
      throw new ValidationError(
        "Monto, tipo, usuario y categoriaId son requeridos"
      );
    }

    // Si NO hay objetivo ⇒ billeteraId es obligatorio
    if (!billeteraId && !objetivo) {
      throw new ValidationError(
        "billeteraId es requerido si la operación no está asociada a un objetivo"
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

    // Resolver billetera:
    // - Si hay objetivo ⇒ SIEMPRE billetera default del usuario
    // - Si no hay objetivo ⇒ usamos billeteraId recibido
    let billeteraRecuperada: any;

    if (objetivo) {
      billeteraRecuperada = await this.billeteraRepository.findOneForUser(user);
      if (!billeteraRecuperada) {
        throw new NotFoundError(
          `El usuario ${user} no tiene una billeteras`
        );
      }
    } else {
      billeteraRecuperada = await this.billeteraRepository.findById(
        billeteraId as string
      );
      if (!billeteraRecuperada)
        throw new NotFoundError(
          `Billetera con ID ${billeteraId} no encontrada`
        );
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

    // Egreso ⇒ sale dinero de la billetera
    // Ingreso ⇒ entra dinero a la billetera
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
  // ANALISIS
  // ----------------------------------------------------------------------

  private generateIntervals(period: AnalysisPeriod, dateStr: string) {
    const referenceDate = new Date(dateStr);
    // Validar fecha invalida
    if (isNaN(referenceDate.getTime())) {
      throw new ValidationError("Fecha proporcionada inválida");
    }

    const labels: string[] = [];
    const buckets: Date[] = [];

    let desde = new Date(referenceDate);
    let hasta = new Date(referenceDate);
    desde.setHours(0, 0, 0, 0);

    if (period === 'weekly') {
      // Lógica Semanal (Lun-Dom)
      const day = desde.getDay();
      // getDay() devuelve 0 para Domingo. Queremos que Lunes sea el inicio.
      // Si es Domingo (0), restamos 6 días. Si es otro, restamos (day - 1).
      const diff = day === 0 ? 6 : day - 1;
      desde.setDate(desde.getDate() - diff); // Lunes de esa semana

      hasta = new Date(desde);
      hasta.setDate(desde.getDate() + 6); // Domingo
      hasta.setHours(23, 59, 59, 999);

      const temp = new Date(desde);
      const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

      for (let i = 0; i < 7; i++) {
        labels.push(days[i]!);
        buckets.push(new Date(temp));
        temp.setDate(temp.getDate() + 1);
      }
      buckets.push(new Date(hasta)); // Límite final

    } else if (period === 'monthly') {
      // Lógica Mensual (Ene-Dic del año seleccionado)
      desde = new Date(referenceDate.getFullYear(), 0, 1);
      hasta = new Date(referenceDate.getFullYear(), 11, 31, 23, 59, 59);

      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const temp = new Date(desde);

      for (let i = 0; i < 12; i++) {
        labels.push(months[i]!);
        buckets.push(new Date(temp));
        temp.setMonth(temp.getMonth() + 1);
      }
      // Importante: El último bucket límite es el inicio del año siguiente
      buckets.push(new Date(referenceDate.getFullYear() + 1, 0, 1));

    } else if (period === 'annual') {
      // Lógica Anual (5 años atrás + actual)
      const endYear = referenceDate.getFullYear();
      const startYear = endYear - 5;

      desde = new Date(startYear, 0, 1);
      hasta = new Date(endYear, 11, 31, 23, 59, 59);

      for (let i = 0; i <= 5; i++) {
        const year = startYear + i;
        labels.push(year.toString());
        buckets.push(new Date(year, 0, 1));
      }
      buckets.push(new Date(endYear + 1, 0, 1));
    }

    return { desde, hasta, labels, buckets };
  }

  // ==========================================
  // MÉTODO PÚBLICO: Calcular Datos
  // ==========================================
  public async calculateAnalysisData(
    userId: string,
    periodo: AnalysisPeriod,
    fecha: string
  ): Promise<AnalysisData> {

    // 1. Generar los intervalos de tiempo
    const { desde, hasta, labels, buckets } = this.generateIntervals(periodo, fecha);

    // 2. Obtener operaciones desde la BD
    const operacionesRaw = await this.operacionRepository.findByFilters({
      userId,
      desde,
      hasta
    });

    const operaciones = operacionesRaw as any[];

    // 3. Estructura base de respuesta
    const response: AnalysisData = {
      monthlyData: new Array(labels.length).fill(0),
      monthlyCategories: labels,
      categoryData: [],
      categoryLabels: [],
      donutData: [],
      donutLabels: [],
      incomeData: new Array(labels.length).fill(0),
      expensesData: new Array(labels.length).fill(0),
      periodCategories: labels
    };

    // 4. Mapas auxiliares para categorías
    const categoryMap: Record<string, number> = {};

    // 5. Procesamiento principal
    operaciones.forEach(op => {
      const opDate = new Date(op.fecha);
      const monto = Number(op.monto); // Asegurar que es número

      // A. Lógica de Categorías (Solo Egresos)
      if (op.tipo === 'Egreso' && op.categoria) {
        const catName = op.categoria.nombre || 'Sin Categoría';
        categoryMap[catName] = (categoryMap[catName] || 0) + monto;
      }

      // B. Lógica de Tiempo (Intervalos)
      let index = -1;
      for (let i = 0; i < buckets.length - 1; i++) {
        if (opDate.getTime() >= buckets[i]!.getTime() && opDate.getTime() < buckets[i + 1]!.getTime()) {
          index = i;
          break;
        }
      }

      if (index !== -1) {
        if (op.tipo === 'Ingreso') {
          response.incomeData[index]! += monto;
        } else if (op.tipo === 'Egreso') {
          response.expensesData[index]! += monto;
          response.monthlyData[index]! += monto; // gráfico de gastos
        }
      }
    });

    // 6. Finalizar datos de categorías
    response.categoryLabels = Object.keys(categoryMap);
    response.categoryData = Object.values(categoryMap);

    // Donut (por ahora igual a categorías)
    response.donutLabels = response.categoryLabels;
    response.donutData = response.categoryData;

    return response;
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
