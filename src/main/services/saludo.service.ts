import { ValidationError } from "@middlewares/error.middleware";

/**
 * Service para manejar la lógica de negocio relacionada con los saludos
 */
export class SaludoService {
  /**
   * Obtiene un mensaje de saludo personalizado
   * @param nombre - Nombre de la persona a saludar
   * @returns Mensaje de saludo formateado
   */
  public obtenerMensajeSaludo(nombre: string): string {
    if (!nombre || nombre.trim().length === 0) {
      throw new ValidationError("El nombre es requerido");
    }
    
    const nombreFormateado = nombre.trim();
    return `Hola, ${nombreFormateado}!`;
  }

  /**
   * Obtiene un saludo genérico
   * @returns Mensaje de saludo genérico
   */
  public obtenerSaludoGenerico(): string {
    return "¡Hola desde la API con TypeScript y Express!";
  }

  /**
   * Valida si un nombre es válido
   * @param nombre - Nombre a validar
   * @returns true si el nombre es válido, false en caso contrario
   */
  public validarNombre(nombre: string): boolean {
    return Boolean(nombre && nombre.trim().length > 0);
  }
}

// Instancia singleton del service
export const saludoService = new SaludoService();
