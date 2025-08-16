import { SaludoService } from "../main/services/saludo.service";

describe("Saludo Service", () => {
  let saludoService: SaludoService;

  beforeEach(() => {
    saludoService = new SaludoService();
  });

  describe("obtenerMensajeSaludo", () => {
    it("debería devolver un saludo con el nombre", () => {
      const nombre = "Carlos";
      const mensaje = saludoService.obtenerMensajeSaludo(nombre);
      expect(mensaje).toBe("Hola, Carlos!");
    });

    it("debería lanzar error si el nombre está vacío", () => {
      expect(() => saludoService.obtenerMensajeSaludo("")).toThrow("El nombre es requerido");
    });

    it("debería lanzar error si el nombre es null", () => {
      expect(() => saludoService.obtenerMensajeSaludo(null as any)).toThrow("El nombre es requerido");
    });

    it("debería trimear espacios en blanco del nombre", () => {
      const nombre = "  Carlos  ";
      const mensaje = saludoService.obtenerMensajeSaludo(nombre);
      expect(mensaje).toBe("Hola, Carlos!");
    });
  });

  describe("obtenerSaludoGenerico", () => {
    it("debería devolver un saludo genérico", () => {
      const mensaje = saludoService.obtenerSaludoGenerico();
      expect(mensaje).toBe("¡Hola desde la API con TypeScript y Express!");
    });
  });

  describe("validarNombre", () => {
    it("debería retornar true para un nombre válido", () => {
      expect(saludoService.validarNombre("Carlos")).toBe(true);
    });

    it("debería retornar false para un nombre vacío", () => {
      expect(saludoService.validarNombre("")).toBe(false);
    });

    it("debería retornar false para un nombre con solo espacios", () => {
      expect(saludoService.validarNombre("   ")).toBe(false);
    });

    it("debería retornar false para null", () => {
      expect(saludoService.validarNombre(null as any)).toBe(false);
    });
  });
});
