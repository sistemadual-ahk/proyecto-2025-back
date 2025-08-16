import { Request, Response } from "express";
import { SaludoController } from "../main/controllers/saludo.controller";
import { ValidationError } from "../main/middlewares/error.middleware";

// Mock del service
jest.mock("../main/services/saludo.service", () => ({
  saludoService: {
    obtenerSaludoGenerico: jest.fn(),
    obtenerMensajeSaludo: jest.fn(),
    validarNombre: jest.fn(),
  },
}));

describe("Saludo Controller", () => {
  let saludoController: SaludoController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    saludoController = new SaludoController();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe("obtenerSaludoGenerico", () => {
    it("debería retornar un saludo genérico exitosamente", () => {
      const { saludoService } = require("../main/services/saludo.service");
      saludoService.obtenerSaludoGenerico.mockReturnValue("¡Hola desde la API!");

      saludoController.obtenerSaludoGenerico(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: "¡Hola desde la API!",
        message: "Saludo obtenido exitosamente",
        timestamp: expect.any(String),
      });
    });
  });

  describe("saludarNombre", () => {
    it("debería retornar un saludo personalizado exitosamente", () => {
      const { saludoService } = require("../main/services/saludo.service");
      saludoService.validarNombre.mockReturnValue(true);
      saludoService.obtenerMensajeSaludo.mockReturnValue("Hola, Carlos!");

      mockRequest.body = { nombre: "Carlos" };

      saludoController.saludarNombre(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: "Hola, Carlos!",
        message: "Saludo personalizado generado exitosamente",
        timestamp: expect.any(String),
      });
    });

    it("debería lanzar ValidationError si el nombre está vacío", () => {
      const { saludoService } = require("../main/services/saludo.service");
      saludoService.validarNombre.mockReturnValue(false);

      mockRequest.body = { nombre: "" };

      expect(() => {
        saludoController.saludarNombre(
          mockRequest as Request,
          mockResponse as Response
        );
      }).toThrow(ValidationError);
    });
  });

  describe("validarNombre", () => {
    it("debería retornar true para un nombre válido", () => {
      const { saludoService } = require("../main/services/saludo.service");
      saludoService.validarNombre.mockReturnValue(true);

      mockRequest.body = { nombre: "Carlos" };

      saludoController.validarNombre(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: { nombre: "Carlos", esValido: true },
        message: "Nombre válido",
        timestamp: expect.any(String),
      });
    });

    it("debería retornar false para un nombre inválido", () => {
      const { saludoService } = require("../main/services/saludo.service");
      saludoService.validarNombre.mockReturnValue(false);

      mockRequest.body = { nombre: "" };

      saludoController.validarNombre(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: { nombre: "", esValido: false },
        message: "Nombre inválido",
        timestamp: expect.any(String),
      });
    });
  });
}); 