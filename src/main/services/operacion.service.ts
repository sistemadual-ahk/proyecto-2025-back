import { Operacion } from "@models/entities/operacion";
import { RepositorioDeOperaciones } from "@models/repositories/repositorioDeOperaciones";
import { ValidationError, ConflictError, NotFoundError } from "../middlewares/error.middleware";
import { RepositorioDeBilleteras, RepositorioDeCategorias, RepositorioDeUsuarios } from "@models/repositories";
import { OperacionDto } from "main/dtos/operacionInputDto";

export class OperacionService {
    constructor(private operacionRepository: RepositorioDeOperaciones, private categoriaRepository: RepositorioDeCategorias, private billeteraRepository: RepositorioDeBilleteras, private userRepository: RepositorioDeUsuarios) {}

    async findAll() {
        const operaciones = await this.operacionRepository.findAll();
        return operaciones.map(o => this.toDTO(o));
    }

    async findAllEgresos() {
        const operaciones = await this.operacionRepository.findByTipo('Egreso');
        return operaciones.map(o => this.toDTO(o));
    }

    async findAllIngresos() {
        const operaciones = await this.operacionRepository.findByTipo('Ingreso');
        return operaciones.map(o => this.toDTO(o));
    }

    async findById(id: string) {
        const operacion = await this.operacionRepository.findById(id);
        if (!operacion) {
            throw new NotFoundError(`Operacion con id ${id} no encontrada`);
        }
        return this.toDTO(operacion);
    }

    async create(operacionData: Partial<OperacionDto>) {
        const { descripcion, monto, tipo, fecha, billeteraId, categoriaId } = operacionData;
        if (!monto || !tipo || !billeteraId || !categoriaId) {
                throw new ValidationError('Monto, tipo, usOperacionDtouario, billetera y categoría son requeridos');
            }

        if (monto === 0) {
            throw new ValidationError('El monto de la operacion no debe ser 0');
        }

        const billeteraRecuperada = await this.billeteraRepository.findById(billeteraId);
        if (!billeteraRecuperada) throw new NotFoundError(`Billetera con ${billeteraId} no encontrado`);
        const categoriaRecuperada = await this.categoriaRepository.findById(categoriaId);
        if (!categoriaRecuperada) throw new NotFoundError(`Categoria con ${categoriaId} no encontrado`);
        const usaerRecuperado = await this.userRepository.findById(billeteraRecuperada.user.id);
        if (!usaerRecuperado) throw new NotFoundError(`Categoria con ${categoriaRecuperada.user?.id} no encontrado`);

        const nuevaOperacion = new Operacion();
        nuevaOperacion.monto = monto;
        nuevaOperacion.descripcion = descripcion;
        nuevaOperacion.fecha = fecha;
        nuevaOperacion.tipo = tipo;
        nuevaOperacion.billetera = billeteraRecuperada;
        nuevaOperacion.categoria = categoriaRecuperada;
        nuevaOperacion.user = usaerRecuperado;

        const operacionGuardada = await this.operacionRepository.save(nuevaOperacion);
        return this.toDTO(operacionGuardada);
    }

    async update(id: string, operacionData: Partial<Operacion>) {
        const operacionExistente = await this.operacionRepository.findById(id);
        if (!operacionExistente) {
            throw new NotFoundError(`Operacion con id ${id} no encontrada`);
        }

        const { descripcion, monto, fecha, tipo, user, billetera, categoria } = operacionData;

        if (monto !== 0) {
            throw new ValidationError('El monto de la operacion no debe ser 0');
        }

        const operacionActualizada = {
            id: id,
            monto: monto || operacionExistente.monto,
            descripcion: descripcion || operacionExistente.descripcion,
            fecha: fecha || operacionExistente.fecha,
            tipo: tipo || operacionExistente.tipo,
            //nuevaOperacion.billetera = billetera; TODO ver de machearlo con el ID de billetera
            //nuevaOperacion.user = user; TODO ver de machearlo con el ID de user
            //nuevaOperacion.categoria = categoria; TODO ver de machearlo con el ID de categoria
            //nuevaOperacion.categoria = categoria; TODO ver de machearlo con el ID de subCategoria
        };

        const resultado = await this.operacionRepository.save(operacionActualizada);
        return this.toDTO(resultado);
    }

    async delete(id: string) {
        const deleted = await this.operacionRepository.deleteById(id);
        if (!deleted) {
            throw new NotFoundError(`Operacion con id ${id} no encontrada`);
        }
        return { success: true, message: 'Operacion eliminada correctamente' };
    }

    private toDTO(operacion: Operacion) {
        return {
            id: operacion.id || (operacion as any)._id,
            descripcion: operacion.descripcion,
            monto: operacion.monto,
            categoria: operacion.categoria,
            billetera: operacion.billetera,
            fecha: operacion.fecha,
            tipo: operacion.tipo,
            user: operacion.user
                ? {
                    id: (operacion.user as any)._id,
                    nombre: (operacion.user as any).nombre,
                    email: (operacion.user as any).email
                }
                : null
        };
    }
} 