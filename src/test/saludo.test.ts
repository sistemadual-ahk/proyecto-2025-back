import { obtenerMensajeSaludo } from "@services/saludo.service";

describe("Saludo Service", () => {
  it("debería devolver un saludo con el nombre", () => {
    const nombre = "Carlos";
    const mensaje = obtenerMensajeSaludo(nombre);
    expect(mensaje).toBe("Hola, Carlos!");
  });
});
