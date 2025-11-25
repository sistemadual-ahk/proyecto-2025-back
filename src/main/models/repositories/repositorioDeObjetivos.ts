import { ObjetivoModel } from "@models/schemas/objetivo.schema";
import { Objetivo, EstadoObjetivo } from "@models/entities/objetivo";
import { Types } from "mongoose";

export class RepositorioDeObjetivos {
  private model: typeof ObjetivoModel;

  constructor() {
    this.model = ObjetivoModel;
  }

  async findAllByUserId(userId: string): Promise<Objetivo[]> {
    const uid = new Types.ObjectId(userId);
    const objetivos = await this.model
      .find({ user: uid })
      .populate("categoria")
      .populate("billetera")
      .populate("user");

    return objetivos as unknown as Objetivo[];
  }

  async findById(id: string): Promise<Objetivo | null> {
    const objetivo = await this.model
      .findById(id)
      .populate("categoria")
      .populate("billetera")
      .populate("user");

    return objetivo as unknown as Objetivo | null;
  }

  async findByIdAndUser(
    id: string,
    userId: string
  ): Promise<Objetivo | null> {
    const objetivo = await this.model
      .findOne({ _id: id, user: userId })
      .populate("categoria")
      .populate("billetera")
      .populate("user");

    return objetivo as unknown as Objetivo | null;
  }

  async findByCategoriaId(categoriaId: string): Promise<Objetivo[]> {
    const objetivos = await this.model
      .find({ categoria: categoriaId })
      .populate("categoria")
      .populate("billetera")
      .populate("user");

    return objetivos as unknown as Objetivo[];
  }

  async save(objetivo: Partial<Objetivo>): Promise<Objetivo> {
    if (objetivo.id) {
      const objetivoActualizado = await this.model
        .findByIdAndUpdate(objetivo.id, objetivo, {
          new: true,
          runValidators: true,
        })
        .populate("categoria")
        .populate("billetera")
        .populate("user");

      return objetivoActualizado as unknown as Objetivo;
    } else {
      const nuevoObjetivo = new this.model(objetivo);
      const objetivoGuardado = await nuevoObjetivo.save();
      return objetivoGuardado as unknown as Objetivo;
    }
  }

  async deleteByIdAndUser(id: string, userId: string): Promise<boolean> {
    const resultado = await this.model.findOneAndDelete({
      _id: id,
      user: userId,
    });
    return resultado !== null;
  }

  async updateMontoYEstado(
    id: string,
    montoActual: number,
    estado: EstadoObjetivo
  ): Promise<Objetivo | null> {
    const actualizado = await this.model
      .findByIdAndUpdate(
        id,
        { montoActual, estado },
        { new: true, runValidators: true }
      )
      .populate("categoria")
      .populate("billetera")
      .populate("user");

    return actualizado as unknown as Objetivo | null;
  }
}
