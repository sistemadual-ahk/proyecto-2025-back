import { ValidationError } from "@middlewares/error.middleware";

export class SaludoService {

  public obtenerMensajeSaludo(nombre: string): string {
    if (!nombre || nombre.trim().length === 0) {
      throw new ValidationError("El nombre es requerido");
    }
    
    const nombreFormateado = nombre.trim();
    return `Hola, ${nombreFormateado}!`;
  }

  public obtenerSaludoGenerico(): string {
    return "¡Hola desde la API con TypeScript y Express!";
  }

  public validarNombre(nombre: string): boolean {
    return Boolean(nombre && nombre.trim().length > 0);
  }
}

export const saludoService = new SaludoService();
