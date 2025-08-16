import { Response } from "express";

export abstract class BaseController {
  protected sendSuccess(
    res: Response, 
    statusCode: number = 200, 
    data: any = null, 
    message?: string
  ): Response {
    const response: any = {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };

    if (message) {
      response.message = message;
    }

    return res.status(statusCode).json(response);
  }
} 