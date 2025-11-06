import saludoRoutes from "@routes/saludo.routes";
import { createCategoriaRoutes } from "@routes/categoria.routes";
import { createUsuarioRoutes } from "./usuario.routes";
import { createBilleteraRoutes } from "./billetera.routes";
import { createObjetivoRoutes } from "./objetivo.routes";
import { createOperacionRoutes } from "./operacion.routes";
import { createProvinciaRoutes } from "./ubicacion/provincia.routes";
import { createProfesionRoutes } from "./profesion.routes";
import { billeteraController, categoriaController, objetivoController, operacionController, usuarioController, provinciaController, profesionController } from "../config/dependencies";

export const routes = [
    { path: "/api/saludos", handler: saludoRoutes },
    { path: "/api/categorias", handler: createCategoriaRoutes(categoriaController) },
    { path: "/api/operaciones", handler: createOperacionRoutes(operacionController) },
    { path: "/api/billeteras", handler: createBilleteraRoutes(billeteraController) },
    { path: "/api/objetivos", handler: createObjetivoRoutes(objetivoController) },
    { path: "/api/usuarios", handler: createUsuarioRoutes(usuarioController) },
    { path: "/api/provincias", handler: createProvinciaRoutes(provinciaController) },
    { path: "/api/profesiones", handler: createProfesionRoutes(profesionController) },
];
