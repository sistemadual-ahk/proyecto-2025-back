import saludoRoutes from "@routes/saludo.routes";
import { createCategoriaRoutes } from "@routes/categoria.routes";
import { categoriaController } from "../config/dependencies";
import { createUsuarioRoutes } from "./usuario.routes";
import { createBilleteraRoutes } from "./billetera.routes";
import { createObjetivoRoutes } from "./objetivo.routes";


export const routes = [
  { path: "/api/saludos", handler: saludoRoutes },
  { path: "/api/categorias", handler: createCategoriaRoutes(categoriaController) },
  /*{ path: "/api/operaciones", handler: createCategoriaRoutes(OperacionController) },
  { path: "/api/categorias", handler: createCategoriaRoutes(categoriaController) },
  { path: "/api/categorias", handler: createCategoriaRoutes(categoriaController) },
  { path: "/api/categorias", handler: createCategoriaRoutes(categoriaController) },
  { path: "/api/categorias", handler: createCategoriaRoutes(categoriaController) },
  */
];