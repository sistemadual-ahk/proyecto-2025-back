import { Operacion } from "@models/entities/operacion";
import { RepositorioDeOperaciones } from "@models/repositories/repositorioDeOperaciones";
import { ValidationError, ConflictError, NotFoundError } from "../middlewares/error.middleware";

export class OperacionService {
    constructor(private operacionRepository: RepositorioDeOperaciones) {}

    // ----------------------------------------------------------------------
    // MÉTODOS FILTRADOS POR USUARIO (NUEVOS - Requeridos por el Controller)
    // ----------------------------------------------------------------------

    /**
     * Busca todas las operaciones (Ingresos y Egresos) para un usuario específico.
     * @param userId ID del usuario autenticado (viene de req.dbUser.id).
     */
    async findAllForUser(userId: string) {
        // Asume que RepositorioDeOperaciones tiene un método findAllByUserId(userId)
        const operaciones = await this.operacionRepository.findAllByUserId(userId);
        return operaciones.map(o => this.toDTO(o));
    }

    /**
     * Busca todas las operaciones de tipo 'Egreso' para un usuario específico.
     * @param userId ID del usuario.
     */
    async findAllEgresosForUser(userId: string) {
        // Asume que RepositorioDeOperaciones tiene un método findByTipoAndUserId(tipo, userId)
        const operaciones = await this.operacionRepository.findByTipoAndUserId('Egreso', userId);
        return operaciones.map(o => this.toDTO(o));
    }

    /**
     * Busca todas las operaciones de tipo 'Ingreso' para un usuario específico.
     * @param userId ID del usuario.
     */
    async findAllIngresosForUser(userId: string) {
        // Asume que RepositorioDeOperaciones tiene un método findByTipoAndUserId(tipo, userId)
        const operaciones = await this.operacionRepository.findByTipoAndUserId('Ingreso', userId);
        return operaciones.map(o => this.toDTO(o));
    }

    // ----------------------------------------------------------------------
    // MÉTODOS EXISTENTES (Modificados para usar findAllForUser si es posible)
    // ----------------------------------------------------------------------

    // Dejamos este findAll() para casos administrativos, aunque en un frontend
    // protegido, se suele usar findAllForUser.
    async findAll() {
        const operaciones = await this.operacionRepository.findAll();
        return operaciones.map(o => this.toDTO(o));
    }

    // Estos métodos existentes, si no reciben userId, probablemente no se usarán
    // directamente en las rutas protegidas, pero los mantenemos.
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

    // ----------------------------------------------------------------------
    // CREATE (Se asume que operacionData ya incluye el ID de usuario desde el Controller)
    // ----------------------------------------------------------------------
    async create(operacionData: Partial<Operacion>) {
        const { descripcion, monto, fecha, tipo, user, billetera, categoria } = operacionData;
        if (!monto || !tipo || !user || !billetera || !categoria) {
            throw new ValidationError('Monto, tipo, usuario, billetera y categoría son requeridos');
        }

        if (monto === 0) {
            throw new ValidationError('El monto de la operacion no debe ser 0');
        }

        const nuevaOperacion = new Operacion();
        nuevaOperacion.monto = monto;
        nuevaOperacion.descripcion = descripcion;
        nuevaOperacion.fecha = fecha;
        nuevaOperacion.tipo = tipo;
        nuevaOperacion.billetera = billetera;
        nuevaOperacion.user = user;
        nuevaOperacion.categoria = categoria;
        
        const operacionGuardada = await this.operacionRepository.save(nuevaOperacion);
        return this.toDTO(operacionGuardada);
    }

    // ----------------------------------------------------------------------
    // UPDATE y DELETE (Sin cambios por ahora)
    // ----------------------------------------------------------------------
    async update(id: string, operacionData: Partial<Operacion>) {
        const operacionExistente = await this.operacionRepository.findById(id);
        if (!operacionExistente) {
            throw new NotFoundError(`Operacion con id ${id} no encontrada`);
        }

        const { descripcion, monto, fecha, tipo, user, billetera, categoria } = operacionData;
        
        // CORRECCIÓN: Esta validación estaba al revés: si el monto NO es 0, no lanzar error.
        // Pero si se lanza si el monto es 0, debería ser:
        if (monto !== undefined && monto === 0) {
            throw new ValidationError('El monto de la operacion no debe ser 0');
        }
        
        const operacionActualizada = {
            id: id,
            monto: monto || operacionExistente.monto,
            descripcion: descripcion || operacionExistente.descripcion,
            fecha: fecha || operacionExistente.fecha,
            tipo: tipo || operacionExistente.tipo,
            // Aquí hay que manejar los IDs de billetera, user y categoría si vienen en operacionData
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
    // DTO MAPPING (Sin cambios)
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
