// Importaciones de Clases de Servicios
import { CategoriaService } from "../services/categoria.service";
import { OperacionService } from "@services/operacion.service";
import { BilleteraService } from "@services/billetera.service";
import { ObjetivoService } from "@services/objetivo.service";
import { UsuarioService } from "@services/usuario.service";
import { ProvinciaService } from "@services/ubicacion/provincia.service";
import { OpenAIService } from "@services/external/openai.service";

// Importaciones de Clases de Controladores
import { CategoriaController } from "../controllers/categoria.controller";
import { OperacionController } from "@controllers/operacion.controller";
import { BilleteraController } from "@controllers/billetera.controller";
import { ObjetivoController } from "@controllers/objetivo.controller";
import { UsuarioController } from "@controllers/usuario.controller";
import { TelegramController } from "@controllers/telegram.controller";
import { ProvinciaController } from "@controllers/ubicacion/provincia.controller";
import { ProfesionController } from "@controllers/profesion.controller";

// Importaciones de Clases de Repositorios
import { RepositorioDeBilleteras, RepositorioDeObjetivos, RepositorioDeOperaciones, RepositorioDeUsuarios, RepositorioDeCategorias, RepositorioDeProvincias } from "@models/repositories";
import { RepositorioDeProfesiones } from "@models/repositories/repositorioDeProfesiones";
import { ProfesionService } from "@services/profesion.service";

// --- REPOSITORIOS (Instanciación) ---
export const categoriaRepo = new RepositorioDeCategorias();
export const operacionRepo = new RepositorioDeOperaciones();
export const billeteraRepo = new RepositorioDeBilleteras();
export const objetivoRepo = new RepositorioDeObjetivos();
export const usuarioRepo = new RepositorioDeUsuarios();
export const provinciaRepo = new RepositorioDeProvincias();
export const profesionRepo = new RepositorioDeProfesiones();

// --- SERVICIOS (Instanciación) ---
export const categoriaService = new CategoriaService(categoriaRepo, usuarioRepo);
export const operacionService = new OperacionService(operacionRepo, categoriaRepo, billeteraRepo, usuarioRepo, objetivoRepo);
export const billeteraService = new BilleteraService(billeteraRepo, usuarioRepo);
export const objetivoService = new ObjetivoService(objetivoRepo, usuarioRepo, billeteraRepo, categoriaRepo, operacionRepo);
export const openaiService = new OpenAIService(operacionRepo, categoriaService);
export const provinciaService = new ProvinciaService(provinciaRepo);
export const profesionService = new ProfesionService(profesionRepo);
// movido abajo xq usuario utiliza ubicacion de provincia
export const usuarioService = new UsuarioService(usuarioRepo, provinciaService, operacionService, categoriaService);

// --- CONTROLADORES (Instanciación) ---
export const categoriaController = new CategoriaController(categoriaService);
export const operacionController = new OperacionController(operacionService);
export const billeteraController = new BilleteraController(billeteraService);
export const objetivoController = new ObjetivoController(objetivoService);
export const telegramController = new TelegramController(openaiService, categoriaService, billeteraService, usuarioService, billeteraRepo);
export const provinciaController = new ProvinciaController(provinciaService);
export const profesionController = new ProfesionController(profesionService);
export const usuarioController = new UsuarioController(usuarioService);
