import { Categoria } from "../models/entities/categoria";
import { RepositorioDeCategorias } from "../models/repositories/repositorioDeCategorias";
import { ValidationError, ConflictError, NotFoundError } from "../middlewares/error.middleware";
import { RepositorioDeUsuarios } from "@models/repositories";

export class CategoriaService {
  constructor(
    private categoriaRepository: RepositorioDeCategorias,
    private userRepository: RepositorioDeUsuarios
  ) {}

  async findAll() {
    const categorias = await this.categoriaRepository.findAll();
    return categorias.map((c) => this.toDTO(c));
  }

  async findAllForUser(userId?: string) {
    if (!userId) {
      throw new NotFoundError(`Usuario con id ${userId} no encontrado`);
    }
    const categorias = await this.categoriaRepository.findAllForUser(userId);
    return categorias.map((c) => this.toDTO(c));
  }

  async findById(id: string) {
    const categoria = await this.categoriaRepository.findById(id);
    if (!categoria) {
      throw new NotFoundError(`Categoría con id ${id} no encontrada`);
    }
    return categoria;
  }

  async findByName(nombre: string) {
    const categoria = await this.categoriaRepository.findByName(nombre);
    if (!categoria) {
      throw new NotFoundError(`Categoría con nombre ${nombre} no encontrada`);
    }
    return categoria;
  }

  async findAllByUser(userId: string) {
    const categorias = await this.categoriaRepository.findAllByUser(userId);
    return categorias.map((c) => this.toDTO(c));
  }

  async create(categoriaData: Partial<Categoria>, userID: string) {
    const { nombre, descripcion, icono, color, iconColor, type } = categoriaData;

    if (!nombre || nombre.trim().length === 0) {
      throw new ValidationError("El nombre de la categoría es requerido");
    }

    const existente = await this.categoriaRepository.findByNameAndUser(
      nombre.trim(),
      userID
    );
    if (existente) {
      throw new ConflictError(`Ya existe una categoría con el nombre ${nombre}`);
    }

    const userRecuperado = await this.userRepository.findById(userID);

    const nuevaCategoria = new Categoria();
    nuevaCategoria.nombre = nombre.trim();
    nuevaCategoria.descripcion = descripcion?.trim() || "";
    nuevaCategoria.icono = icono || "";
    nuevaCategoria.color = color || "";
    nuevaCategoria.iconColor = iconColor || "#111827";
    nuevaCategoria.type = type ?? "expense";
    nuevaCategoria.isDefault = false;
    nuevaCategoria.user = userRecuperado;

    const categoriaGuardada = await this.categoriaRepository.save(
      nuevaCategoria
    );
    return this.toDTO(categoriaGuardada);
  }

  async update(id: string, categoriaData: Partial<Categoria>) {
    const categoriaExistente = await this.categoriaRepository.findById(id);
    if (!categoriaExistente) {
      throw new NotFoundError(`Categoría con id ${id} no encontrada`);
    }

    const { nombre, descripcion, icono, color, iconColor, type } = categoriaData;

    if (nombre && nombre.trim().length === 0) {
      throw new ValidationError(
        "El nombre de la categoría no puede estar vacío"
      );
    }

    if (nombre && nombre !== categoriaExistente.nombre) {
      const existente = await this.categoriaRepository.findByName(
        nombre.trim()
      );
      if (existente) {
        throw new ConflictError(
          `Ya existe una categoría con el nombre ${nombre}`
        );
      }
    }

    const categoriaActualizada: Partial<Categoria> & { id: string } = {
      id: id,
      nombre: nombre?.trim() || categoriaExistente.nombre,
      descripcion: descripcion?.trim() || categoriaExistente.descripcion,
      icono: icono || categoriaExistente.icono,
      color: color || categoriaExistente.color,
      iconColor: iconColor || categoriaExistente.iconColor,
      type: type || categoriaExistente.type,
    };

    const resultado = await this.categoriaRepository.save(categoriaActualizada);
    return this.toDTO(resultado);
  }

  async delete(id: string) {
    const deleted = await this.categoriaRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError(`Categoría con id ${id} no encontrada`);
    }
    return { success: true, message: "Categoría eliminada correctamente" };
  }

  private toDTO(categoria: Categoria) {
    const user = (categoria as Categoria).user;
    return {
      id: categoria.id || (categoria as Categoria)._id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      icono: categoria.icono,
      color: categoria.color,
      iconColor: categoria.iconColor,
      type: categoria.type,
      isDefault: categoria.isDefault,
      user: user
        ? {
            id: user._id?.toString?.() || user.id,
            name: user.name,
          }
        : null,
    };
  }
}
