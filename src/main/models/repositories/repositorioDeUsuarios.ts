import { UsuarioModel } from "../schemas/usuario.schema";
import { Usuario, UsuarioComparacion, UsuarioWithMatchBy } from "../entities/usuario";
import mongoose, { mongo } from "mongoose";
import { accentInsensitiveRegex } from "main/utils/regexAccent";
import { CriteriosComparacionDTO } from "main/dtos/comparacionUsuarioDto";
import { UserInfo } from "os";
interface Ubicacion {
    provincia: string;
    municipio: string;
    localidad: string;
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

    async findSimilarBySueldo(sueldo: number, id: string, count: number = 5): Promise<Usuario[] | null> {
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

    async findSimilarByProfesion(profesion: string, id: string, count: number = 5): Promise<Usuario[] | null> {
        const profesionRegex = profesion ? accentInsensitiveRegex(profesion) : null;

        // add regex para profesion
        const usuarios = await this.model.find({ _id: { $ne: new mongoose.Types.ObjectId(id) }, profesion: { $regex: profesionRegex } }).limit(count);

        return usuarios as unknown as Usuario[] | null;
    }

    async findSimilarByUbicacion(ubicacion: Ubicacion, id: string, count: number = 5, exactitud: string = "provincia"): Promise<UsuarioWithMatchBy[] | null> {
        const { provincia, municipio, localidad } = ubicacion;

        // regex por nivel solo si no son vacios
        const provinciaRegex = provincia ? accentInsensitiveRegex(provincia) : null;
        const municipioRegex = municipio ? accentInsensitiveRegex(municipio) : null;
        const localidadRegex = localidad ? accentInsensitiveRegex(localidad) : null;

        // matcheos por nivel
        const matchProvincia = provinciaRegex ? { $regexMatch: { input: "$ubicacion.provincia", regex: provinciaRegex } } : true;
        const matchMunicipio = municipioRegex ? { $regexMatch: { input: "$ubicacion.municipio", regex: municipioRegex } } : true;
        const matchLocalidad = localidadRegex ? { $regexMatch: { input: "$ubicacion.localidad", regex: localidadRegex } } : true;

        // pipeline
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pipeline: any[] = [
            // 1. excluir usuario actual
            { $match: { _id: { $ne: new mongoose.Types.ObjectId(id) } } },

            // 2. calcular matcheos por nivel
            {
                $addFields: {
                    matchBy: {
                        $switch: {
                            branches: [
                                {
                                    case: { $and: [matchProvincia, matchMunicipio, matchLocalidad] },
                                    then: "localidad",
                                },
                                {
                                    case: { $and: [matchProvincia, matchMunicipio] },
                                    then: "municipio",
                                },
                                {
                                    case: matchProvincia,
                                    then: "provincia",
                                },
                            ],
                            default: "none",
                        },
                    },
                },
            },
        ];

        // 3. determinar exactitud
        if (exactitud) {
            const hierarchy = ["provincia", "municipio", "localidad"];
            const minLevel = hierarchy.indexOf(exactitud);
            const allowedLevels = hierarchy.slice(minLevel); // filtrar por exactitud minima de las 3
            pipeline.push({ $match: { matchBy: { $in: allowedLevels } } });
        } else {
            // descartar los que no matchean nada
            pipeline.push({ $match: { matchBy: { $ne: "none" } } });
        }

        // 4. aplicar exactitud o nivel de match
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

        // 5. sort y limit
        pipeline.push({ $sort: { sortValue: -1 } }, { $limit: count });

        // 6. exportar y return
        const usuarios = await this.model.aggregate(pipeline);
        return usuarios as unknown as UsuarioWithMatchBy[] | null;
    }

    // paso el user actual ya que voy a acceder a sus datos (sueldo, id)
    async findCandidatesForComparisonOptimized(usuarioActual: Usuario, criterios: CriteriosComparacionDTO, count: number = 5): Promise<UsuarioComparacion[]> {
        // get id actual
        // el ?? agarra lo de la izquierda si no es null o undefined, sino lo de la derecha. Alguno de los 2 siempre deberia estar definido
        const idUsuarioActual = new mongoose.Types.ObjectId((usuarioActual as Usuario)._id?.toString() ?? usuarioActual.id);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const pipeline: mongoose.PipelineStage[] = [];

        // excluir usuario actual
        pipeline.push({ $match: { _id: { $ne: idUsuarioActual } } });

        // filtro excluyente de profesion
        const profesionRegex = criterios.profesion && criterios.profesion.trim() !== "" ? accentInsensitiveRegex(criterios.profesion) : null;
        if (profesionRegex) {
            pipeline.push({ $match: { profesion: { $regex: profesionRegex } } });
        }
        // finalizado el filtro excluyente
        // comenzamos a ordenar/rankear
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const pesosParaRanking = {
            profesion: criterios.profesion ? 100 : 1,
            sueldo: criterios.sueldo == true ? 250 : 1,
            provincia: criterios.ubicacion?.provincia ? 5 : 1,
            municipio: criterios.ubicacion?.municipio ? 15 : 1,
            localidad: criterios.ubicacion?.localidad ? 30 : 1,
        };
        const scoreProfesión = profesionRegex
            ? {
                  $cond: [{ $regexMatch: { input: "$profesion", regex: profesionRegex } }, pesosParaRanking.profesion, 0],
              }
            : 0;
        // score por sueldo
        // score por sueldo (curva exponencial)
        const scoreSueldo = criterios.sueldo
            ? {
                  $let: {
                      vars: {
                          diff: { $abs: { $subtract: ["$sueldo", usuarioActual.sueldo] } },
                          peso: pesosParaRanking.sueldo,
                          escala: 20000, // ajustable
                      },
                      in: {
                          // peso * exp( - diff / escala )
                          $multiply: [
                              "$$peso",
                              {
                                  $exp: {
                                      $multiply: [-1, { $divide: ["$$diff", "$$escala"] }],
                                  },
                              },
                          ],
                      },
                  },
              }
            : 1;

        // score por ubicacion
        const { provincia = null, municipio = null, localidad = null } = criterios.ubicacion ?? {};

        // Ubicación normalizada
        const loc = {
            provincia: provincia !== undefined && typeof provincia == "string" ? provincia : null,
            municipio: municipio !== undefined && typeof municipio == "string" ? municipio : null,
            localidad: localidad !== undefined && typeof localidad == "string" ? localidad : null,
        };

        const scoreUbicacion = [
            // localidad
            pesosParaRanking.localidad && loc.localidad
                ? {
                      $cond: [{ $eq: ["$ubicacion.localidad", loc.localidad] }, pesosParaRanking.localidad, 0],
                  }
                : 0,

            // municipio
            pesosParaRanking.municipio && loc.municipio
                ? {
                      $cond: [{ $eq: ["$ubicacion.municipio", loc.municipio] }, pesosParaRanking.municipio, 0],
                  }
                : 0,

            // provincia
            pesosParaRanking.provincia && loc.provincia
                ? {
                      $cond: [{ $eq: ["$ubicacion.provincia", loc.provincia] }, pesosParaRanking.provincia, 0],
                  }
                : 0,
        ];

        // aplico filtros en un campo score
        pipeline.push({
            $addFields: {
                score: {
                    $add: [scoreProfesión, scoreSueldo, ...scoreUbicacion],
                },
            },
        });

        // ordeno por score descendente
        pipeline.push({ $sort: { score: -1 } });

        // limitar cantidad de resultados
        pipeline.push({ $limit: count });

        // proyeccion del resultado
        pipeline.push({
            $project: {
                _id: 1,
                sueldo: 1,
                profesion: 1,
                ubicacion: 1,
                score: 1,
            },
        });

        const resultados = await this.model.aggregate(pipeline);

        const candidatos: UsuarioComparacion[] = resultados.map((r) => ({
            id: r._id.toString(),
            sueldo: r.sueldo ?? null,
            profesion: r.profesion ?? null,
            ubicacion: r.ubicacion ?? null,
            score: r.score,
        }));
        console.log("Candidatos encontrados:", candidatos);
        // console.log(candidatos[0]);
        return candidatos;
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
