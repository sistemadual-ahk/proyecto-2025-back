import { Request, Response } from 'express';
import { ProvinciaService } from '@services/ubicacion/provincia.service'; // Asegúrate de que esta ruta sea correcta

export class ProvinciaController {
    // El constructor recibe el servicio (dependencia)
    constructor(private provinciaService: ProvinciaService) {}

    /**
     * @description Maneja la petición GET /api/provincias, llama al servicio y envía la respuesta.
     */
    public getAllProvincias = async (req: Request, res: Response): Promise<void> => {
        try {
            // 1. Llama al método del servicio para obtener los datos
            const provincias = await this.provinciaService.findAll();
            
            // 2. Envía una respuesta exitosa
            res.status(200).json(provincias);
            
        } catch (error) {
            // 3. Manejo de errores
            console.error('Error al obtener las provincias:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener provincias.' });
        }
    };
    
    // Aquí puedes agregar otros métodos como getProvinciaById, etc.
}