import { OperacionModel } from "@models/schemas/operacion.schema";
import { Operacion } from "@models/entities/operacion";
import mongoose from "mongoose";

type OperacionFilters = {
  userId?: string;
  tipo?: string;
  categoriaId?: string;
  billeteraId?: string;
  desde?: Date;
  hasta?: Date;
};

export class RepositorioDeOperaciones {
  private model: typeof OperacionModel;

  constructor() {
    this.model = OperacionModel;
  }

  // ----------------------------------------------------------------------
  // MÉTODOS DE BÚSQUEDA POR USUARIO
  // ----------------------------------------------------------------------

  async findAllByUserId(userId: string): Promise<Operacion[]> {
    const operaciones = await this.model
      .find({ user: userId })
      .populate("categoria")
      .populate("billetera")
      .populate("user");
    return operaciones as unknown as Operacion[];
  }

  async findByTipoAndUserId(
    tipo: string,
    userId: string
  ): Promise<Operacion[]> {
    const operaciones = await this.model
      .find({ tipo, user: userId })
      .populate("categoria")
      .populate("billetera")
      .populate("user");
    return operaciones as unknown as Operacion[];
  }

  // ----------------------------------------------------------------------
  // MÉTODOS EXISTENTES
  // ----------------------------------------------------------------------

  async findAll(): Promise<Operacion[]> {
    const operaciones = await this.model
      .find()
      .populate("categoria")
      .populate("billetera")
      .populate("user");
    return operaciones as unknown as Operacion[];
  }

  async findById(id: string): Promise<Operacion | null> {
    const operacion = await this.model
      .findById(id)
      .populate("categoria")
      .populate("billetera")
      .populate("user");
    return operacion as unknown as Operacion | null;
  }

  async findByTipo(tipo: string): Promise<Operacion[]> {
    const operaciones = await this.model
      .find({ tipo })
      .populate("categoria")
      .populate("billetera")
      .populate("user");
    return operaciones as unknown as Operacion[];
  }

  async findByFilters(filters: OperacionFilters): Promise<Operacion[]> {
    const query: any = {};

    if (filters.userId) {
      query.user = filters.userId;
    }
    if (filters.tipo) {
      query.tipo = filters.tipo;
    }
    if (filters.categoriaId) {
      query.categoria = filters.categoriaId;
    }
    if (filters.billeteraId) {
      query.billetera = filters.billeteraId;
    }
    if (filters.desde || filters.hasta) {
      query.fecha = {};
      if (filters.desde) query.fecha.$gte = filters.desde;
      if (filters.hasta) query.fecha.$lte = filters.hasta;
    }

    const operaciones = await this.model
      .find(query)
      .populate("categoria")
      .populate("billetera")
      .populate("user");

    return operaciones as unknown as Operacion[];
  }

  async save(operacion: Partial<Operacion>): Promise<Operacion> {
    if (operacion.id) {
      const operacionActualizada = await this.model
        .findByIdAndUpdate(operacion.id, operacion, {
          new: true,
          runValidators: true,
        })
        .populate("categoria")
        .populate("billetera")
        .populate("user");
      return operacionActualizada as unknown as Operacion;
    } else {
      const nuevaOperacion = new this.model({
        ...operacion,
        user: new mongoose.Types.ObjectId(operacion.user as any),
        billetera: operacion.billetera
          ? new mongoose.Types.ObjectId(operacion.billetera as any)
          : undefined,
        categoria: operacion.categoria
          ? new mongoose.Types.ObjectId(operacion.categoria as any)
          : undefined,
      });

      const operacionGuardada = await nuevaOperacion.save();
      return operacionGuardada as unknown as Operacion;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    const resultado = await this.model.findByIdAndDelete(id);
    return resultado !== null;
  }

  // ----------------------------------------------------------------------
  // NUEVOS MÉTODOS PARA OBJETIVOS
  // ----------------------------------------------------------------------

  async findByObjetivoId(
    objetivoId: string,
    userId?: string
  ): Promise<Operacion[]> {
    const query: any = { objetivo: objetivoId };
    if (userId) {
      query.user = userId;
    }

    const operaciones = await this.model
      .find(query)
      .populate("categoria")
      .populate("billetera")
      .populate("user");

    return operaciones as unknown as Operacion[];
  }

  async calcularMontoTotalPorObjetivo(
    objetivoId: string,
    userId?: string
  ): Promise<number> {
    const match: any = {
      objetivo: new mongoose.Types.ObjectId(objetivoId),
    };

    if (userId) {
      match.user = new mongoose.Types.ObjectId(userId);
    }

    const resultado = await this.model.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$monto" } } },
    ]);

    return resultado[0]?.total ?? 0;
  }
}
