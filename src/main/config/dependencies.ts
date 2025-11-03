import { CategoriaService } from "../services/categoria.service";
import { OperacionService } from "@services/operacion.service";
import { BilleteraService } from "@services/billetera.service";
import { ObjetivoService } from "@services/objetivo.service";
import { UsuarioService } from "@services/usuario.service";
import { CategoriaController } from "../controllers/categoria.controller";
import { OperacionController } from "@controllers/operacion.controller";
import { BilleteraController } from "@controllers/billetera.controller";
import { ObjetivoController } from "@controllers/objetivo.controller";
import { UsuarioController } from "@controllers/usuario.controller";
import { RepositorioDeBilleteras, RepositorioDeObjetivos, RepositorioDeOperaciones, RepositorioDeUsuarios, RepositorioDeCategorias, RepositorioDeProvincias } from "@models/repositories";
import { OpenAIService } from "@services/external/openai.service";
import { TelegramController } from "@controllers/telegram.controller";

// Repositorios
export const categoriaRepo = new RepositorioDeCategorias();
export const operacionRepo = new RepositorioDeOperaciones();
export const billeteraRepo = new RepositorioDeBilleteras();
export const objetivoRepo = new RepositorioDeObjetivos();
export const usuarioRepo = new RepositorioDeUsuarios();
export const provinciaRepo = new RepositorioDeProvincias();

// Servicios
export const categoriaService = new CategoriaService(categoriaRepo, usuarioRepo);
export const operacionService = new OperacionService(operacionRepo, categoriaRepo, billeteraRepo, usuarioRepo);
export const billeteraService = new BilleteraService(billeteraRepo, usuarioRepo);
export const objetivoService = new ObjetivoService(objetivoRepo, usuarioRepo, billeteraRepo, categoriaRepo);
export const usuarioService = new UsuarioService(usuarioRepo);
import { ProvinciaService } from "@services/ubicacion/provincia.service";
export const openaiService = new OpenAIService(operacionRepo, categoriaService);

// Controladores
export const categoriaController = new CategoriaController(categoriaService); 
export const operacionController = new OperacionController(operacionService); 
export const billeteraController = new BilleteraController(billeteraService); 
export const objetivoController = new ObjetivoController(objetivoService); 
export const usuarioController = new UsuarioController(usuarioService); 
export const telegramController = new TelegramController(openaiService, categoriaService, billeteraService, usuarioService);
