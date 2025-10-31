import { UsuarioModel } from '../schemas/usuario.schema';
import { Usuario } from '../entities/usuario';

export class 
RepositorioDeUsuarios {
    private model: typeof UsuarioModel;

    constructor() {
        this.model = UsuarioModel;
    }

    async findAll(): Promise<Usuario[]> {
        const usuarios = await this.model.find();
        return usuarios as unknown as Usuario[];
    }

    async findById(id: string): Promise<Usuario | null> {
        const usuario = await this.model.findById(id);
        return usuario as unknown as Usuario | null;
    }

    async findByEmail(mail: string): Promise<Usuario | null> {
        const usuario = await this.model.findOne({ mail });
        return usuario as unknown as Usuario | null;
    }

    async save(usuario: Partial<Usuario>): Promise<Usuario> {
        if (usuario.id) {
            const usuarioActualizado = await this.model.findByIdAndUpdate(
                usuario.id,
                usuario,
                { new: true, runValidators: true }
            );
            return usuarioActualizado as unknown as Usuario;
        } else {
            const nuevoUsuario = new this.model(usuario);
            const usuarioGuardado = await nuevoUsuario.save();
            return usuarioGuardado as unknown as Usuario;
        }
    }

    async deleteById(id: string): Promise<boolean> {
        const resultado = await this.model.findByIdAndDelete(id);
        return resultado !== null;
    }
}
