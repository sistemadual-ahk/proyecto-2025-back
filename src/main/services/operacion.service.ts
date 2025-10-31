import { Operacion } from "@models/entities/operacion";
import { RepositorioDeOperaciones } from "@models/repositories/repositorioDeOperaciones";
import { ValidationError, ConflictError, NotFoundError } from "../middlewares/error.middleware";
import { RepositorioDeBilleteras, RepositorioDeCategorias, RepositorioDeUsuarios } from "@models/repositories";

// Tipo para los filtros, que ahora también recibe el userId
type OperacionFilters = {
    tipo?: string;
    categoriaId?: string;
    billeteraId?: string;
    desde?: Date; // Ya convertidos a Date por el Controller o Service
    hasta?: Date;
};

// Tipo de datos que el método create espera (incluyendo user ID)
type OperacionInputData = {
    monto: number;
    tipo: string; // 'income' o 'expense'
    billetera: string; // ID
    categoria: string; // ID
    user: string; // ID del usuario autenticado
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
        desde?: string; // Recibe string
        hasta?: string;
    }) {
        const { userID, tipo, categoriaId, billeteraId, desde, hasta } = filters;

        // Conversión de fechas dentro del servicio
        const parsedDesde = desde ? new Date(desde) : undefined;
        const parsedHasta = hasta ? new Date(hasta) : undefined;

        const operaciones = await this.operacionRepository.findByFilters({
            userID,
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
        // Idealmente, añadir: if (operacion.user.id !== userId) throw NotAuthorizedError...
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

        // Validación básica
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
        // ... (Validaciones y lógica existente, idealmente verificar userId) ...
        const operacionExistente = await this.operacionRepository.findById(id);
        if (!operacionExistente) throw new NotFoundError(`Operacion con id ${id} no encontrada`);
        // Añadir: if (operacionExistente.user.id !== userId) throw NotAuthorized...

        const { descripcion, monto, fecha, tipo } = operacionData;

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
        // ... (Lógica existente, idealmente verificar userId antes de borrar) ...
        const operacion = await this.operacionRepository.findById(id);
        if (!operacion) throw new NotFoundError(`Operacion con id ${id} no encontrada`);
        // Añadir: if (operacion.user.id !== userId) throw NotAuthorized...

        const deleted = await this.operacionRepository.deleteById(id);
        if (!deleted) {
            throw new NotFoundError(`Operacion con id ${id} no se pudo eliminar`);
        }
        return { success: true, message: 'Operacion eliminada correctamente' };
    }

    // ----------------------------------------------------------------------
    // DTO MAPPING
    // ----------------------------------------------------------------------
    private toDTO(operacion: Operacion) {
        // ... (Tu función toDTO existente) ...
        return {
            id: operacion.id || (operacion as any)._id,
            descripcion: operacion.descripcion,
            monto: operacion.monto,
            categoria: operacion.categoria, // Puede necesitar poblarse o mapear a DTO
            billetera: operacion.billetera, // Puede necesitar poblarse o mapear a DTO
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
