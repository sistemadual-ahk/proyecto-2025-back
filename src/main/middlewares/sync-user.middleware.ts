// src/middlewares/sync-user.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { UsuarioModel } from '../models/schemas/usuario.schema'; // Importa tu modelo actualizado
// Opcional: Extender el objeto Request para que TypeScript lo entienda mejor
export interface RequestWithAuth extends Request {
  auth?: { sub?: string; email?: string; name?: string; };
  dbUser?: any;
}

export const syncUser = async (req: RequestWithAuth, res: Response, next: NextFunction) => {
  try {
    const auth0User = req.auth; 
    
    if (!auth0User || !auth0User.sub) {
      return res.status(401).send('No se encontró la información del usuario.');
    }

    // Buscar al usuario usando el auth0Id
    let user = await UsuarioModel.findOne({ auth0Id: auth0User.sub });

    if(!user) {
      next();
      return;
    }

    /*if (!user) {
      // Si el usuario no existe, créalo con la información del token
      user = new UsuarioModel({
        auth0Id: auth0User.sub,
        mail: auth0User.email, 
        name: auth0User.name
      });
      await user.save();
      console.log(`Nuevo usuario sincronizado con ID de Auth0: ${user.auth0Id}`);
    }*/

    // Adjuntar el usuario de la DB a la petición
    req.dbUser = user;

    next();
  } catch (error) {
    console.error('Error al sincronizar el usuario:', error);
    res.status(500).send('Error interno del servidor.');
  }
};