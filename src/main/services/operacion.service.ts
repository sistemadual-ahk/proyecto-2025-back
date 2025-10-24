import { Operacion } from "@models/entities/operacion";
import { RepositorioDeOperaciones } from "@models/repositories/repositorioDeOperaciones";
import { ValidationError, ConflictError, NotFoundError } from "../middlewares/error.middleware";
import { RepositorioDeBilleteras, RepositorioDeCategorias, RepositorioDeUsuarios } from "@models/repositories";
import { OperacionDto } from "main/dtos/operacionInputDto";

// CRÍTICO: Definimos un tipo que incluye todos los campos esperados, 
// incluso los que el Controller adjunta (user).
type OperacionInputData = {
    monto: number;
    tipo: string; // Recibimos 'income'/'expense'
    billetera: string; // Asumimos que viene el ID
    categoria: string; // Asumimos que viene el ID
    user: string;      // CRÍTICO: Viene inyectado desde el Controller
    descripcion?: string;
    fecha?: Date;
};


export class OperacionService {
    constructor(
        private operacionRepository: RepositorioDeOperaciones,
        private categoriaRepository: RepositorioDeCategorias,
        private billeteraRepository: RepositorioDeBilleteras,
        private userRepository: RepositorioDeUsuarios
    ) { }

    // ----------------------------------------------------------------------
    // MÉTODOS FILTRADOS POR USUARIO
    // ----------------------------------------------------------------------

    async findAllForUser(userId: string) {
        const operaciones = await this.operacionRepository.findAllByUserId(userId);
        return operaciones.map(o => this.toDTO(o));
    }

    async findAllEgresosForUser(userId: string) {
        const operaciones = await this.operacionRepository.findByTipoAndUserId('Egreso', userId);
        return operaciones.map(o => this.toDTO(o));
    }

    async findAllIngresosForUser(userId: string) {
        const operaciones = await this.operacionRepository.findByTipoAndUserId('Ingreso', userId);
        return operaciones.map(o => this.toDTO(o));
    }

    // ----------------------------------------------------------------------
    // MÉTODOS EXISTENTES
    // ----------------------------------------------------------------------

    async findByFilters(filters: {
        userID?: string;
        tipo?: string;
        categoriaId?: string;
        billeteraId?: string;
        desde?: string;
        hasta?: string;
    }) {
        const { tipo, categoriaId, billeteraId, desde, hasta } = filters;

        const parsedDesde = desde ? new Date(desde) : undefined;
        const parsedHasta = hasta ? new Date(hasta) : undefined;

        const operaciones = await this.operacionRepository.findByFilters({
            tipo,
            categoriaId,
            billeteraId,
            desde: parsedDesde,
            hasta: parsedHasta
        });
        return operaciones.map(o => this.toDTO(o));
    }

    async findById(id: string) {
        const operacion = await this.operacionRepository.findById(id);
        if (!operacion) {
            throw new NotFoundError(`Operacion con id ${id} no encontrada`);
        }
        return this.toDTO(operacion);
    }

    // ----------------------------------------------------------------------
    // CREATE (CORREGIDO)
    // ----------------------------------------------------------------------
    async create(operacionData: OperacionInputData) {
        const { descripcion, monto, tipo, fecha, billetera, categoria, user } = operacionData;

        // 1. Validación de campos requeridos (incluye 'user', inyectado por el Controller)
        if (!monto || !tipo || !user || !billetera || !categoria) {
            throw new ValidationError('Monto, tipo, usuario, billetera y categoría son requeridos');
        }

        if (monto === 0) {
            throw new ValidationError('El monto de la operacion no debe ser 0');
        }

        // 2. Traducción y validación del tipo de operación (CRÍTICO)
        let tipoFinal: string;
        if (tipo === 'income') {
            tipoFinal = 'Ingreso';
        } else if (tipo === 'expense') {
            tipoFinal = 'Egreso';
        } else {
            throw new ValidationError('El tipo de operacion debe ser Ingreso o Egreso');
        }

        // 3. Verificación de existencia y recuperación de OBJETOS para Mongoose
        const billeteraRecuperada = await this.billeteraRepository.findById(billetera as string);
        if (!billeteraRecuperada) throw new NotFoundError(`Billetera con ID ${billetera} no encontrada`);

        const categoriaRecuperada = await this.categoriaRepository.findById(categoria as string);
        if (!categoriaRecuperada) throw new NotFoundError(`Categoria con ID ${categoria} no encontrada`);

        // Recuperamos el objeto Usuario completo para Mongoose
        const usuarioRecuperado = await this.userRepository.findById(user);
        if (!usuarioRecuperado) throw new NotFoundError(`Usuario con ID ${user} no encontrado`);

        // 4. Creación y asignación de la entidad
        const nuevaOperacion = new Operacion();
        nuevaOperacion.monto = monto;
        nuevaOperacion.descripcion = descripcion;
        nuevaOperacion.fecha = fecha;
        nuevaOperacion.tipo = tipoFinal as any; // Usamos el valor traducido

        // Asignamos las entidades/objetos recuperados
        nuevaOperacion.billetera = billeteraRecuperada;
        nuevaOperacion.categoria = categoriaRecuperada;
        nuevaOperacion.user = usuarioRecuperado;

        const operacionGuardada = await this.operacionRepository.save(nuevaOperacion);
        return this.toDTO(operacionGuardada);
    }

    // ----------------------------------------------------------------------
    // UPDATE y DELETE 
    // ----------------------------------------------------------------------
    async update(id: string, operacionData: Partial<Operacion>) {
        const operacionExistente = await this.operacionRepository.findById(id);
        if (!operacionExistente) {
            throw new NotFoundError(`Operacion con id ${id} no encontrada`);
        }

        const { descripcion, monto, fecha, tipo, user, billetera, categoria } = operacionData;

        if (monto !== undefined && monto === 0) {
            throw new ValidationError('El monto de la operacion no debe ser 0');
        }

        const operacionActualizada = {
            id: id,
            monto: monto !== undefined ? monto : operacionExistente.monto,
            descripcion: descripcion || operacionExistente.descripcion,
            fecha: fecha || operacionExistente.fecha,
            tipo: tipo || operacionExistente.tipo,
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