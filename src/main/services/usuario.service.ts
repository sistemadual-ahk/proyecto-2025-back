import { Usuario } from "../models/entities/usuario";
import { RepositorioDeUsuarios } from "@models/repositories/repositorioDeUsuarios";
import { ValidationError, NotFoundError, ConflictError } from "../middlewares/error.middleware";

export class UsuarioService {
    constructor(private usuarioRepository: RepositorioDeUsuarios) {}

    async findAll() {
        const usuarios = await this.usuarioRepository.findAll();
        return usuarios.map(u => this.toDTO(u));
    }

    async findById(id: string) {
        const usuario = await this.usuarioRepository.findById(id);
        if (!usuario) throw new NotFoundError(`Usuario con id ${id} no encontrado`);
        return this.toDTO(usuario);
    }

    async create(usuarioData: Partial<Usuario>) {
        const { name, mail, password, phoneNumber } = usuarioData;
        if (!name || !mail || !password || !phoneNumber) throw new ValidationError('Todos los campos son requeridos');

        const existente = await this.usuarioRepository.findByEmail(mail.trim().toLowerCase());
        if (existente) throw new ConflictError(`Ya existe un usuario con el mail ${mail}`);

        const nuevoUsuario = new Usuario();
        nuevoUsuario.name = name.trim();
        nuevoUsuario.mail = mail.trim().toLowerCase();
        nuevoUsuario.phoneNumber = phoneNumber;
        nuevoUsuario.password = password; // considerar hash después

        const guardado = await this.usuarioRepository.save(nuevoUsuario);
        return this.toDTO(guardado);
    }

    async update(id: string, usuarioData: Partial<Usuario>) {
        const usuarioExistente = await this.usuarioRepository.findById(id);
        if (!usuarioExistente) throw new NotFoundError(`Usuario con id ${id} no encontrado`);

        const { name, mail, password, phoneNumber } = usuarioData;

        if (mail && mail !== usuarioExistente.mail) {
            const existente = await this.usuarioRepository.findByEmail(mail.trim().toLowerCase());
            if (existente) throw new ConflictError(`Ya existe un usuario con el mail ${mail}`);
        }

        const actualizado = {
            id: id,
            name: name?.trim() || usuarioExistente.name,
            mail: mail?.trim().toLowerCase() || usuarioExistente.mail,
            phoneNumber: phoneNumber || usuarioExistente.phoneNumber,
            password: password || usuarioExistente.password
        };

        const resultado = await this.usuarioRepository.save(actualizado);
        return this.toDTO(resultado);
    }

    async delete(id: string) {
        const deleted = await this.usuarioRepository.deleteById(id);
        if (!deleted) throw new NotFoundError(`Usuario con id ${id} no encontrado`);
        return { success: true, message: 'Usuario eliminado correctamente' };
    }

    private toDTO(usuario: Usuario) {
        return {
            id: usuario.id || (usuario as any)._id,
            name: usuario.name,
            mail: usuario.mail,
            phoneNumber: usuario.phoneNumber,
            password: usuario.password,
        };
    }
}
