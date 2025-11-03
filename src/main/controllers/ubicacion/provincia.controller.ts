import { Request, Response } from 'express';
import { ProvinciaService } from '@services/ubicacion/provincia.service';

export class ProvinciaController {
    constructor(private provinciaService: ProvinciaService) {}

    public getAllProvincias = async (req: Request, res: Response): Promise<void> => {
        try {
            const provincias = await this.provinciaService.findAll();
            res.status(200).json(provincias);
        } catch (error) {
            console.error('Error fetching provincias:', error);
            res.status(500).json({ message: 'Error al obtener las provincias' });
        }
    };
}