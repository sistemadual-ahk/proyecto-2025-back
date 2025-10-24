// src/middlewares/sync-user.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { UsuarioModel } from '../models/schemas/usuario.schema';

export interface RequestWithAuth extends Request {
  auth?: { sub?: string; email?: string; name?: string; };
  dbUser?: any;
}

export const syncUser = async (req: RequestWithAuth, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth0User = req.auth;

    if (!auth0User || !auth0User.sub) {
      res.status(401).send('No se encontró la información del usuario.');
      return;
    }

    // Buscar al usuario usando el auth0Id
    let user = await UsuarioModel.findOne({ auth0Id: auth0User.sub });

    if (!user) {
      return next();
    }
  }
  catch (error) {
    console.error('Error al sincronizar el usuario:', error);
    res.status(500).send('Error interno del servidor.');
    return;
  }
}