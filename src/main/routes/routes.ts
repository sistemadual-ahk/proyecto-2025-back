import saludoRoutes from "@routes/saludo.routes";
import { createCategoriaRoutes } from "@routes/categoria.routes";
import { categoriaController } from "../config/dependencies";

export const routes = [
  { path: "/api/saludos", handler: saludoRoutes },
  { path: "/api/categorias", handler: createCategoriaRoutes(categoriaController) },
];