import { UsuarioModel } from "../schemas/usuario.schema";
import { Usuario, UsuarioWithMatchBy } from "../entities/usuario";
import mongoose from "mongoose";
import { accentInsensitiveRegex } from "main/utils/regexAccent";
import { CriteriosComparacionDTO } from "main/dtos/comparacionUsuarioDto";
interface Ubicacion {
    provincia: string | null;
    municipio: string | null;
    localidad: string | null;
}
export class RepositorioDeUsuarios {
    private model: typeof UsuarioModel;

    constructor() {
        this.model = UsuarioModel;
    }

    async findAll(): Promise<Usuario[]> {
        const usuarios = await this.model.find();
        return usuarios as unknown as Usuario[];
    }

    async findById(id: string): Promise<Usuario | null> {
        const usuario = await this.model.findById(id);
        return usuario as unknown as Usuario | null;
    }

    async findByAuthId(authId: string): Promise<Usuario | null> {
        const usuario = await this.model.findOne({ auth0Id: authId });
        return usuario as unknown as Usuario | null;
    }

    async findByTelegramId(telegramId: string): Promise<Usuario | null> {
        const usuario = await this.model.findOne({ telegramId });
        return usuario as unknown as Usuario | null;
    }

    async findSimilarBySueldo(sueldo: number, id: string, count: number = 1): Promise<Usuario[] | null> {
        const usuarios = await this.model.aggregate([
            { $match: { _id: { $ne: new mongoose.Types.ObjectId(id) }, sueldo: { $ne: null } } }, // exclude the user with the given id
            {
                $addFields: {
                    diff: { $abs: { $subtract: ["$sueldo", sueldo] } }, // compute |value - target|
                },
            },
            { $sort: { diff: 1 } }, // smallest difference first
            { $limit: count }, // keep only the closest N
            {
                $project: {
                    //diff: 0,
                    auth0Id: 1,
                    telegramId: 1,
                    name: 1,
                    mail: 1,
                    phoneNumber: 1,
                    sueldo: 1,
                    profesion: 1,
                    estadoCivil: 1,
                    ubicacion: 1,
                    _id: 1,
                },
            },
        ]);
        // console.log(usuarios);
        return usuarios as unknown as Usuario[] | null;
    }

    async findSimilarByProfesion(profesion: string, id: string, count: number = 1): Promise<Usuario[] | null> {
        const usuarios = await this.model.find({ profesion, _id: { $ne: new mongoose.Types.ObjectId(id) } }).limit(count);
        return usuarios as unknown as Usuario[] | null;
    }

    async findSimilarByUbicacion(ubicacion: Ubicacion, id: string, count: number = 1, exactitud: string = "provincia"): Promise<UsuarioWithMatchBy[] | null> {
        const { provincia, municipio, localidad } = ubicacion;
        // 🧩 Build accent-insensitive regexes
        const provinciaRegex = accentInsensitiveRegex(provincia!);
        const municipioRegex = accentInsensitiveRegex(municipio!);
        const localidadRegex = accentInsensitiveRegex(localidad!);

        // 🧮 Aggregation pipeline
        // 🧱 Base pipeline
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pipeline: any[] = [
            // 1️⃣ Exclude the same user
            { $match: { _id: { $ne: new mongoose.Types.ObjectId(id) } } },

            // 2️⃣ Compute the match level
            {
                $addFields: {
                    matchBy: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $and: [{ $regexMatch: { input: "$ubicacion.provincia", regex: provinciaRegex } }, { $regexMatch: { input: "$ubicacion.municipio", regex: municipioRegex } }, { $regexMatch: { input: "$ubicacion.localidad", regex: localidadRegex } }],
                                    },
                                    then: "localidad",
                                },
                                {
                                    case: {
                                        $and: [{ $regexMatch: { input: "$ubicacion.provincia", regex: provinciaRegex } }, { $regexMatch: { input: "$ubicacion.municipio", regex: municipioRegex } }],
                                    },
                                    then: "municipio",
                                },
                                {
                                    case: { $regexMatch: { input: "$ubicacion.provincia", regex: provinciaRegex } },
                                    then: "provincia",
                                },
                            ],
                            default: "none",
                        },
                    },
                },
            },
        ];

        // 3️⃣ Apply the "exactitud" filter dynamically
        if (exactitud) {
            const hierarchy = ["provincia", "municipio", "localidad"];
            const minLevel = hierarchy.indexOf(exactitud);

            // Match only equal or stronger matches
            const allowedLevels = hierarchy.slice(minLevel);

            pipeline.push({ $match: { matchBy: { $in: allowedLevels } } });
        } else {
            // Default: discard completely unrelated users
            pipeline.push({ $match: { matchBy: { $ne: "none" } } });
        }

        // 4️⃣ Sort strongest matches first
        pipeline.push({
            $addFields: {
                sortValue: {
                    $switch: {
                        branches: [
                            { case: { $eq: ["$matchBy", "localidad"] }, then: 3 },
                            { case: { $eq: ["$matchBy", "municipio"] }, then: 2 },
                            { case: { $eq: ["$matchBy", "provincia"] }, then: 1 },
                        ],
                        default: 0,
                    },
                },
            },
        });

        // 5️⃣ Final sort + limit
        pipeline.push({ $sort: { sortValue: -1 } }, { $limit: count });

        const usuarios = await this.model.aggregate(pipeline);
        return usuarios as unknown as UsuarioWithMatchBy[] | null;
    }

    async findCandidateUsuarioForComparison(_id: string, _criterios: CriteriosComparacionDTO): Promise<Usuario[]> {
        const usuarios = await this.model.find();
        return usuarios as unknown as Usuario[];
    }

    async findByEmail(mail: string): Promise<Usuario | null> {
        const usuario = await this.model.findOne({ mail });
        return usuario as unknown as Usuario | null;
    }

    async save(usuario: Partial<Usuario>): Promise<Usuario> {
        if (usuario.id) {
            const usuarioActualizado = await this.model.findByIdAndUpdate(usuario.id, usuario, { new: true, runValidators: true });
            return usuarioActualizado as unknown as Usuario;
        } else {
            const nuevoUsuario = new this.model(usuario);
            const usuarioGuardado = await nuevoUsuario.save();
            return usuarioGuardado as unknown as Usuario;
        }
    }

    async deleteById(id: string): Promise<boolean> {
        const resultado = await this.model.findByIdAndDelete(id);
        return resultado !== null;
    }
}
