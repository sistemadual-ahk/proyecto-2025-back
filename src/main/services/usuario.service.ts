import { Usuario, UsuarioWithMatchBy } from "@models/entities/usuario";
import { RepositorioDeUsuarios } from "@models/repositories/repositorioDeUsuarios";
import { ValidationError, NotFoundError, ConflictError } from "../middlewares/error.middleware";
import { ProvinciaService } from "./ubicacion/provincia.service";
import { ubicacionToDebugString } from "main/utils/debugUtils";

interface Ubicacion {
    provincia: string;
    municipio: string;
    localidad: string;
}

export class UsuarioService {
    constructor(private usuarioRepository: RepositorioDeUsuarios, private provinciaService: ProvinciaService) {}

    async findAll() {
        const usuarios = await this.usuarioRepository.findAll();
        return usuarios.map((u) => this.toDTO(u));
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

        const { name, mail, password, phoneNumber, sueldo, profesion, estadoCivil, ubicacion } = usuarioData;

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
}
