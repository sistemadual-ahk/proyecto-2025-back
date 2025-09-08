import { BilleteraModel } from '../schemas/billetera.schema';
import { Billetera } from '../entities/billetera';
import { Types } from 'mongoose';

export class RepositorioDeBilleteras {
    private model: typeof BilleteraModel;

    constructor() {
        this.model = BilleteraModel;
    }

    async findAll(userId?: string): Promise<Billetera[]> {
        const query = userId ? { user: userId } : {};
        const billeteras = await this.model.find(query).populate('user');
        return billeteras as unknown as Billetera[];
    }

    async findById(id: string): Promise<Billetera | null> {
        const billetera = await this.model.findById(id).populate('user');
        return billetera as unknown as Billetera | null;
    }

    async findAllForUser(userId: string): Promise<Billetera[]> {
            const uid = new Types.ObjectId(userId);
            const billetera = await this.model.find({user: uid}).populate('user', 'name _id');
            return billetera as unknown as Billetera[];
        }

    async findByNameAndUser(nombre: string, userId: string): Promise<Billetera | null> {
        const uid = new Types.ObjectId(userId);
        const billetera = await this.model.findOne({ nombre, user: uid }).populate('user', 'name _id');
        return billetera as unknown as Billetera | null;
    }

    async save(billetera: Partial<Billetera>): Promise<Billetera> {
        if (billetera.id) {
            const billeteraActualizada = await this.model.findByIdAndUpdate(
                billetera.id,
                billetera,
                { new: true, runValidators: true }
            ).populate('user');
            return billeteraActualizada as unknown as Billetera;
        } else {
            const nuevaBilletera = new this.model(billetera);
            const billeteraGuardada = await nuevaBilletera.save();
            return billeteraGuardada as unknown as Billetera;
        }
    }

    async deleteById(id: string): Promise<boolean> {
        const resultado = await this.model.findByIdAndDelete(id);
        return resultado !== null;
    }
}
