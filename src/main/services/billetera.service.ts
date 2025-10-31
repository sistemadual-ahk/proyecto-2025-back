import { Billetera } from "../models/entities/billetera";
import { RepositorioDeBilleteras } from "@models/repositories/repositorioDeBilleteras";
import { ValidationError, NotFoundError, ConflictError } from "../middlewares/error.middleware";
import { RepositorioDeUsuarios } from "@models/repositories";

export class BilleteraService {
    constructor(private billeteraRepository: RepositorioDeBilleteras, private userRepository: RepositorioDeUsuarios) {}

    async findAll() {
        const billeteras = await this.billeteraRepository.findAll();
        return billeteras.map(b => this.toDTO(b));
    }

    async findAllForUser(userId?: string) {
            if (!userId) {
                throw new NotFoundError(`Usuario con id ${userId} no encontrado`);
            }
            const billeteras = await this.billeteraRepository.findAllForUser(userId);
            return billeteras.map(c => this.toDTO(c));
        }

    async findById(id: string) {
        const billetera = await this.billeteraRepository.findById(id);
        if (!billetera) throw new NotFoundError(`Billetera con id ${id} no encontrada`);
        return this.toDTO(billetera);
    }

    async create(billeteraData: Partial<Billetera>, userID: string) {
        const { nombre, balance, balanceHistorico } = billeteraData;

        if (!nombre) throw new ValidationError('Nombre y usuario son requeridos');
        const userRecuperado = await this.userRepository.findById(userID);
        if (!userRecuperado) throw new NotFoundError(`Usuario con ${userID} no encontrado`);
        const existente = await this.billeteraRepository.findByNameAndUser(nombre.trim(), userID);
        if (existente) throw new ConflictError(`Ya existe una billetera con el nombre ${nombre} para este usuario`);

        const nuevaBilletera = new Billetera();
        nuevaBilletera.nombre = nombre.trim();
        nuevaBilletera.balance = balance || 0;
        nuevaBilletera.balanceHistorico = balanceHistorico || 0;
        nuevaBilletera.user = userRecuperado;
        nuevaBilletera.color = billeteraData.color || '';

        const guardada = await this.billeteraRepository.save(nuevaBilletera);
        return this.toDTO(guardada);
    }

    async update(id: string, billeteraData: Partial<Billetera>) {
        const billeteraExistente = await this.billeteraRepository.findById(id);
        if (!billeteraExistente) throw new NotFoundError(`Billetera con id ${id} no encontrada`);

        const { nombre, balance, balanceHistorico, color } = billeteraData;

        const actualizado = {
            id: id,
            nombre: nombre?.trim() || billeteraExistente.nombre,
            color: color || billeteraExistente.color,
            balance: balance || billeteraExistente.balance,
            balanceHistorico: balanceHistorico || billeteraExistente.balanceHistorico
        };

        const resultado = await this.billeteraRepository.save(actualizado);
        return this.toDTO(resultado);
    }

    async delete(id: string) {
        const deleted = await this.billeteraRepository.deleteById(id);
        if (!deleted) throw new NotFoundError(`Billetera con id ${id} no encontrada`);
        return { success: true, message: 'Billetera eliminada correctamente' };
    }

    private toDTO(billetera: Billetera) {
        return {
            id: billetera.id || (billetera as any)._id,
            nombre: billetera.nombre,
            balance: billetera.balance,
            balanceHistorico: billetera.balanceHistorico,
            color: billetera.color,
            user: billetera.user.id
        };
    }
}