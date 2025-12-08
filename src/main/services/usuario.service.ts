import { Usuario, UsuarioWithMatchBy } from "@models/entities/usuario";
import { RepositorioDeUsuarios } from "@models/repositories/repositorioDeUsuarios";
import { ValidationError, NotFoundError, ConflictError } from "../middlewares/error.middleware";
import { ProvinciaService } from "./ubicacion/provincia.service";
import { ubicacionToDebugString } from "main/utils/debugUtils";
import { OperacionService } from "./operacion.service";
import { CategoriaService } from "./categoria.service";
import { ComparacionUsuarioDto, ComparacionUsuariosResponseDto, CategoriaComparacionDto, CriteriosComparacionDTO } from "../dtos/comparacionUsuarioDto";

interface Ubicacion {
    provincia: string;
    municipio: string;
    localidad: string;
}

export class UsuarioService {
    constructor(private usuarioRepository: RepositorioDeUsuarios, private provinciaService: ProvinciaService, private operacionService: OperacionService, private categoriaService: CategoriaService) {}

    async findAll() {
        const usuarios = await this.usuarioRepository.findAll();
        return usuarios.map((u) => this.toDTO(u));
    }

    async findByAuthId(authId: string) {
        const usuario = await this.usuarioRepository.findByAuthId(authId);
        if (!usuario) throw new NotFoundError(`Usuario con authId ${authId} no encontrado`);
        return this.toDTO(usuario);
    }

    async findById(id: string) {
        const usuario = await this.usuarioRepository.findById(id);
        if (!usuario) throw new NotFoundError(`Usuario con id ${id} no encontrado`);
        return this.toDTO(usuario);
    }

    async findByTelegramId(telegramId: string) {
        const usuario = await this.usuarioRepository.findByTelegramId(telegramId);
        if (!usuario) throw new NotFoundError(`Usuario con id ${telegramId} no encontrado`);
        return this.toDTO(usuario);
    }

    async findSimilarBySueldo(sueldo: number, id: string, count: number = 1) {
        const usuarios = await this.usuarioRepository.findSimilarBySueldo(sueldo, id, count);
        if (!usuarios) throw new NotFoundError(`Usuario similar con sueldo cercano a ${sueldo} no encontrado`);
        return usuarios.map((u) => this.toDTO(u));
    }
    async findSimilarByProfesion(profesion: string, id: string, count: number = 1) {
        const usuarios = await this.usuarioRepository.findSimilarByProfesion(profesion, id, count);
        if (!usuarios) throw new NotFoundError(`Usuario similar con profesion ${profesion} no encontrado`);
        return usuarios.map((u) => this.toDTO(u));
    }

    async findSimilarByUbicacion(ubicacion: Ubicacion, id: string, count: number = 1, exactitud: string = "provincia") {
        const usuarios = await this.usuarioRepository.findSimilarByUbicacion(ubicacion, id, count, exactitud);

        const allowedExactitud = new Set(["provincia", "municipio", "localidad"]);
        if (!allowedExactitud.has(exactitud)) {
            throw new ValidationError(`Valor de "exactitud" inválido: ${exactitud}. Debe ser "provincia", "municipio" o "localidad".`);
        }

        if (!usuarios) throw new NotFoundError(`Usuario similar con ubicacion ${ubicacionToDebugString(ubicacion)} no encontrado`);

        return usuarios.map((u: UsuarioWithMatchBy) => {
            const { matchBy, ...rest } = u;
            return {
                ...this.toDTO(rest),
                matchBy,
            };
        });
    }

    async create(usuarioData: Partial<Usuario>) {
        const { name, mail, auth0Id } = usuarioData;
        if (!name || !mail || !auth0Id) throw new ValidationError("Todos los campos son requeridos");

        const existente = await this.usuarioRepository.findByEmail(mail.trim().toLowerCase());
        if (existente) throw new ConflictError(`Ya existe un usuario con el mail ${mail}`);

        const nuevoUsuario = new Usuario();
        nuevoUsuario.name = name.trim();
        nuevoUsuario.mail = mail.trim().toLowerCase();
        nuevoUsuario.auth0Id = auth0Id;

        const guardado = await this.usuarioRepository.save(nuevoUsuario);
        return this.toDTO(guardado);
    }

    async update(id: string, usuarioData: Partial<Usuario>) {
        // verificar existencia
        const usuarioExistente = await this.usuarioRepository.findById(id);
        if (!usuarioExistente) throw new NotFoundError(`Usuario con id ${id} no encontrado`);

        const { name, mail, password, phoneNumber, sueldo, situacionLaboral, profesion, estadoCivil, ubicacion } = usuarioData;

        // console.log("ProvinciaService:", this.provinciaService);

        // Actualizar email
        if (mail && mail !== usuarioExistente.mail) {
            const existente = await this.usuarioRepository.findByEmail(mail.trim().toLowerCase());
            if (existente) throw new ConflictError(`Ya existe un usuario con el mail ${mail}`);
        }

        let nuevaUbicacion = usuarioExistente.ubicacion;

        if (ubicacion) {
            const { provincia, municipio, localidad } = ubicacion;
            const ubicacionCompleta = provincia && municipio && localidad;

            if (!ubicacionCompleta) {
                throw new ValidationError("Debe elegir Provincia + Municipio + Localidad para modificar ubicacion");
            }

            // suponiendo que esta completa:
            // Verificar en base de datos (nuevo formato)
            // Verificar en base de datos (nuevo formato)
            const ubicacionResult = await this.provinciaService.verificarUbicacionCompleta(provincia, municipio, localidad);

            if (!ubicacionResult.exists) {
                const debugMsgUbicacion = `${provincia} > ${municipio} > ${localidad}`;
                throw new ValidationError(`La combinación ${debugMsgUbicacion} no existe.`);
            }

            // Usar las formas correctas que existen en la BD
            nuevaUbicacion = {
                provincia: ubicacionResult.provincia,
                municipio: ubicacionResult.municipio,
                localidad: ubicacionResult.localidad,
            };
        }

        const actualizado = {
            id: id,
            name: name?.trim() || usuarioExistente.name,
            mail: mail?.trim().toLowerCase() || usuarioExistente.mail,
            phoneNumber: phoneNumber || usuarioExistente.phoneNumber,
            password: password || usuarioExistente.password,
            sueldo: sueldo || usuarioExistente.sueldo,
            situacionLaboral: situacionLaboral || usuarioExistente.situacionLaboral,
            estadoCivil: estadoCivil || usuarioExistente.estadoCivil,
            profesion: profesion || usuarioExistente.profesion,
            ubicacion: nuevaUbicacion,
        };

        const resultado = await this.usuarioRepository.save(actualizado);
        return this.toDTO(resultado);
    }

    async delete(id: string) {
        const deleted = await this.usuarioRepository.deleteById(id);
        if (!deleted) throw new NotFoundError(`Usuario con id ${id} no encontrado`);
        return { success: true, message: "Usuario eliminado correctamente" };
    }

    async compararUsuarios(usuarioActualId: string, usuarioCompararId: string, mes?: number, año?: number): Promise<ComparacionUsuariosResponseDto> {
        // Validar que ambos usuarios existan
        const usuarioActual = await this.usuarioRepository.findById(usuarioActualId);
        if (!usuarioActual) throw new NotFoundError(`Usuario actual con id ${usuarioActualId} no encontrado`);

        const usuarioComparar = await this.usuarioRepository.findById(usuarioCompararId);
        if (!usuarioComparar) throw new NotFoundError(`Usuario a comparar con id ${usuarioCompararId} no encontrado`);

        // * Calcular fechas del mes (si no se proporcionan, usar el mes ANTERIOR al actual)
        const fechaActual = new Date();

        let mesActual = mes !== undefined ? mes : fechaActual.getMonth();
        // parametro de 1 a 12 = mes humano
        // getMonth() => 0 a 11, mes humano => +1, por defecto quiero el anterior => -1
        mesActual = (((mesActual - 1) % 12) + 12) % 12; // prevenir valores fuera de rango, normaliza a 0-11

        const añoActual = año !== undefined ? año : fechaActual.getFullYear();

        // Primer día del mes
        const desde = new Date(añoActual, mesActual, 1);
        // Último día del mes
        const hasta = new Date(añoActual, mesActual + 1, 0, 23, 59, 59, 999);
        // console.log("desde: ", desde, " hasta: ", hasta);

        // Obtener operaciones de ambos usuarios del mes (solo egresos/gastos)
        const operacionesActual = await this.operacionService.findByFilters({
            userId: usuarioActualId,
            tipo: "Egreso",
            desde: desde.toISOString(),
            hasta: hasta.toISOString(),
        });

        const operacionesComparar = await this.operacionService.findByFilters({
            userId: usuarioCompararId,
            tipo: "Egreso",
            desde: desde.toISOString(),
            hasta: hasta.toISOString(),
        });

        // Obtener todas las categorías default para ambos usuarios
        const categoriasActual = await this.categoriaService.findAllForUser(usuarioActualId);
        // const categoriasComparar = await this.categoriaService.findAllForUser(usuarioCompararId);

        // Filtrar solo categorías default
        const categoriasDefault = categoriasActual.filter((c) => c.isDefault);

        // Procesar datos del usuario actual
        const datosActual = this.procesarDatosUsuario(
            usuarioActual,
            operacionesActual,
            categoriasDefault,
            true // incluir nombre
        );

        // Procesar datos del usuario a comparar
        const datosComparar = this.procesarDatosUsuario(
            usuarioComparar,
            operacionesComparar,
            categoriasDefault,
            false // no incluir nombre
        );

        return {
            usuarios: [datosActual, datosComparar],
        };
    }

    async compararUsuarioPorCriterios(usuarioActualId: string, criterios: CriteriosComparacionDTO) {
        const usuarioActual = await this.usuarioRepository.findById(usuarioActualId);
        if (!usuarioActual) {
            throw new NotFoundError(`Usuario actual con id ${usuarioActualId} no  encontrado`);
        }

        const candidato = await this.encontrarCandidatoParaComparacion(usuarioActualId, criterios);
        if (!candidato || candidato == null) {
            throw new NotFoundError("No se encontró ningún usuario que coincida con los criterios proporcionados");
        }
        const comparacion = await this.compararUsuarios(usuarioActualId, candidato.id, criterios.mes, criterios.año);

        // TODO retornar solo la comparacion entre ambos usuarios
        return { usuarioActual: this.toDTO(usuarioActual), candidato: this.toDTO(candidato), comparacion };
    }

    async encontrarCandidatoParaComparacion(usuarioActualId: string, criterios: CriteriosComparacionDTO): Promise<Usuario | null> {
        const usuarioActual = await this.usuarioRepository.findById(usuarioActualId);
        if (!usuarioActual) {
            throw new NotFoundError(`Usuario actual con id ${usuarioActualId} no encontrado`);
        }

        // Lista de candidatos
        const TOP_N_CANDIDATOS = 3;
        const candidatos = await this.usuarioRepository.findCandidatesForComparisonOptimized(usuarioActual, criterios, TOP_N_CANDIDATOS);

        // si buscamos por alguna profesion que es unicamente de 1 solo usuario, puede que no haya candidatos
        if (!candidatos || candidatos.length === 0) {
            return null;
        }

        const elegido = this.pickRandomGeometric(candidatos, 0.6);
        const elegidoCompleto = await this.usuarioRepository.findById(elegido!.id);

        return elegidoCompleto ?? null;
    }

    private procesarDatosUsuario(usuario: Usuario, operaciones: any[], categoriasDefault: any[], incluirNombre: boolean): ComparacionUsuarioDto {
        // Agrupar operaciones por categoría y calcular montos totales
        const categoriasMap = new Map<string, { nombre: string; montoTotal: number }>();

        // Inicializar todas las categorías default con monto 0
        categoriasDefault.forEach((cat) => {
            const catId = cat.id || (cat as any)._id?.toString() || String((cat as any)._id);
            if (catId) {
                categoriasMap.set(catId, {
                    nombre: cat.nombre,
                    montoTotal: 0,
                });
            }
        });

        // Procesar operaciones y sumar montos por categoría
        let primeraFecha: Date | null = null;
        let ultimaFecha: Date | null = null;

        operaciones.forEach((op) => {
            const categoria = op.categoria;
            if (!categoria) return;

            const catId = categoria.id || (categoria as any)._id?.toString() || String((categoria as any)._id);
            if (catId && categoriasMap.has(catId)) {
                const categoriaData = categoriasMap.get(catId)!;
                categoriaData.montoTotal += op.monto || 0;
            }

            // Calcular primera y última fecha
            if (op.fecha) {
                const fechaOp = new Date(op.fecha);
                if (!primeraFecha || fechaOp < primeraFecha) {
                    primeraFecha = fechaOp;
                }
                if (!ultimaFecha || fechaOp > ultimaFecha) {
                    ultimaFecha = fechaOp;
                }
            }
        });

        // Convertir map a array
        const categorias: CategoriaComparacionDto[] = Array.from(categoriasMap.entries()).map(([categoriaId, data]) => ({
            categoriaId,
            nombre: data.nombre,
            montoTotal: data.montoTotal,
        }));

        const resultado: ComparacionUsuarioDto = {
            sueldo: usuario.sueldo || null,
            profesion: usuario.profesion || null,
            estadoCivil: usuario.estadoCivil || null,
            ubicacion: usuario.ubicacion || null,
            categorias,
            totalOperaciones: operaciones.length,
            primeraFechaMes: primeraFecha || null,
            ultimaFechaMes: ultimaFecha || null,
        };

        if (incluirNombre) {
            resultado.name = usuario.name;
        }

        return resultado;
    }

    private toDTO(usuario: Usuario) {
        return {
            id: usuario.id || (usuario as any)._id,
            authId: usuario.auth0Id,
            telegramId: usuario.telegramId,
            name: usuario.name,
            mail: usuario.mail,
            phoneNumber: usuario.phoneNumber,
            sueldo: usuario.sueldo,
            profesion: usuario.profesion,
            estadoCivil: usuario.estadoCivil,
            ubicacion: usuario.ubicacion || null,
        };
    }

    private normalizarId<T extends { id?: string; _id?: string }>(doc: T): T & { id: string } {
        if (!doc) return doc as any;

        const id = doc.id || doc._id?.toString?.() || String(doc._id);

        return {
            ...doc,
            id,
        };
    }

    private normalizarUbicacion(input?: { provincia?: string; municipio?: string; localidad?: string }): Ubicacion | null {
        if (!input) return null;
        return {
            provincia: input.provincia ?? "",
            municipio: input.municipio ?? "",
            localidad: input.localidad ?? "",
        };
    }
    private pickRandomGeometric<T>(items: T[], factor: number): T | null {
        if (items.length === 0) return null;

        const pesos = items.map((item, index) => Math.pow(factor, index));
        const total = pesos.reduce((a, b) => a + b, 0);

        const r = Math.random() * total;
        let acumulado = 0;

        for (let i = 0; i < items.length; i++) {
            acumulado += pesos[i]!;
            if (r <= acumulado) {
                return items[i]! as T | null;
            }
        }

        return items[items.length - 1]!;
    }
}
