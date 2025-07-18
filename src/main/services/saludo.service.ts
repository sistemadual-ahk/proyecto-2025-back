// Aqui colocamos el codigo de las funciones que utilicemos en nuestros controladores (se recomienda que se coloquen en un archivo por separado)
// Aquí se define la lógica de negocio relacionada con los saludos.
export const obtenerMensajeSaludo = (nombre: string): string => {
  return `Hola, ${nombre}!`;
};
