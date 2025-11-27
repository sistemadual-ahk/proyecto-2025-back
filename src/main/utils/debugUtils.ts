export function ubicacionToDebugString(ubicacion: { provincia: string; municipio: string; localidad: string }): string {
    const debugMsgUbicacion = `${ubicacion.provincia} > ${ubicacion.municipio} > ${ubicacion.localidad}`;
    return debugMsgUbicacion;
}
