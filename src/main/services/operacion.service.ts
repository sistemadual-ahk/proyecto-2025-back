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

    // --- MÉTODOS FILTRADOS POR USUARIO (Actualizados/Añadidos) ---

    async findAllForUser(userId: string) {
        // Llama al método correcto del repositorio
        const operaciones = await this.operacionRepository.findAllByUserId(userId);
        return operaciones.map(o => this.toDTO(o));
    }

    async findAllEgresosForUser(userId: string) {
        // Llama al método correcto del repositorio
        const operaciones = await this.operacionRepository.findByTipoAndUserId('Egreso', userId);
        return operaciones.map(o => this.toDTO(o));
    }

    async findAllIngresosForUser(userId: string) {
        // Llama al método correcto del repositorio
        const operaciones = await this.operacionRepository.findByTipoAndUserId('Ingreso', userId);
        return operaciones.map(o => this.toDTO(o));
    }

    // --- MÉTODOS EXISTENTES (Modificados) ---

    // Este método ya no es ideal para rutas protegidas
    async findAll() {
        const operaciones = await this.operacionRepository.findAll();
        return operaciones.map(o => this.toDTO(o));
    }

    /**
     * CORRECCIÓN: findByFilters ahora recibe userId y lo pasa al repositorio.
     */
    async findByFilters(userId: string, filters: { // Ajustamos la firma aquí
        tipo?: string;
        categoriaId?: string;
        billeteraId?: string;
        desde?: string; // Recibe string
        hasta?: string;
    }) {
        const { tipo, categoriaId, billeteraId, desde, hasta } = filters;

        // Conversión de fechas dentro del servicio
        const parsedDesde = desde ? new Date(desde) : undefined;
        const parsedHasta = hasta ? new Date(hasta) : undefined;

        // Llama al método correcto del repositorio, pasando userId
        const operaciones = await this.operacionRepository.findByFilters(userId, {
            tipo,
            categoriaId,
            billeteraId,
            desde: parsedDesde,
            hasta: parsedHasta
        });
        return operaciones.map(o => this.toDTO(o));
    }

    // Estos métodos ya no son ideales para rutas protegidas
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
        // Idealmente, añadir: if (operacion.user.id !== userId) throw NotAuthorizedError...
        return this.toDTO(operacion);
    }

    // --- CREATE (Corregido completamente) ---
    async create(operacionData: OperacionInputData) {
        const { descripcion, monto, tipo, fecha, billetera, categoria, user } = operacionData;

        // Validación básica
        if (!monto || !tipo || !user || !billetera || !categoria) {
            throw new ValidationError('Monto, tipo, usuario, billetera y categoría son requeridos');
        }
        if (monto === 0) {
            throw new ValidationError('El monto de la operacion no debe ser 0');
        }

        // Mapeo de tipo
        let tipoFinal: string;
        if (tipo.toLowerCase() === 'income') {
            tipoFinal = 'Ingreso';
        } else if (tipo.toLowerCase() === 'expense') {
            tipoFinal = 'Egreso';
        } else {
            throw new ValidationError('El tipo de operacion debe ser Ingreso o Egreso');
        }

        // Recuperar entidades relacionadas usando los IDs
        const billeteraRecuperada = await this.billeteraRepository.findById(billetera);
        if (!billeteraRecuperada) throw new NotFoundError(`Billetera con ID ${billetera} no encontrada`);

        const categoriaRecuperada = await this.categoriaRepository.findById(categoria);
        if (!categoriaRecuperada) throw new NotFoundError(`Categoria con ID ${categoria} no encontrada`);

        const usuarioRecuperado = await this.userRepository.findById(user);
        if (!usuarioRecuperado) throw new NotFoundError(`Usuario con ID ${user} no encontrado`);

        // Crear la nueva entidad Operacion con los OBJETOS recuperados
        const nuevaOperacion = new Operacion();
        nuevaOperacion.monto = monto;
        nuevaOperacion.descripcion = descripcion;
        nuevaOperacion.fecha = fecha || new Date(); // Valor por defecto si no viene fecha
        nuevaOperacion.tipo = tipoFinal as any;
        nuevaOperacion.billetera = billeteraRecuperada;
        nuevaOperacion.categoria = categoriaRecuperada;
        nuevaOperacion.user = usuarioRecuperado;

        const operacionGuardada = await this.operacionRepository.save(nuevaOperacion);
        return this.toDTO(operacionGuardada);
    }

    // --- UPDATE y DELETE (Sin cambios funcionales mayores, pero considerar seguridad userId) ---
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
            // Falta lógica para actualizar billetera/categoría si se permite
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

    // --- DTO MAPPING (Sin cambios) ---
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

