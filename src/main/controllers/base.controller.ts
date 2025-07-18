import { Response } from "express";

export const enviarRespuesta = (res: Response, statusCode: number, data: any) => {
  return res.status(statusCode).json({ data });
};

export const enviarError = (res: Response, statusCode: number, error: string) => {
  return res.status(statusCode).json({ error });
};
