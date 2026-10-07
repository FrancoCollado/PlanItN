import { getOrm } from '../../../config/orm.js';
import { Evento } from '../../../entities/evento.js';
export const listEventos = async (includeDraft = false) => {
    const em = getOrm().em.fork();
    return em.find(Evento, includeDraft ? {} : { draft: false }, { orderBy: { creadoEn: 'DESC' } });
};
export const getEventoById = async (id) => {
    const em = getOrm().em.fork();
    return em.findOne(Evento, { id });
};
export const createEvento = async (data) => {
    const em = getOrm().em.fork();
    const evento = em.create(Evento, {
        nombre: data.nombre,
        descripcion: data.descripcion,
        imagen: data.imagen,
        draft: data.draft ?? true,
        creadoEn: new Date()
    });
    await em.persist(evento).flush();
    return evento;
};
export const updateEvento = async (id, data) => {
    const em = getOrm().em.fork();
    const evento = await em.findOne(Evento, { id });
    if (!evento)
        return null;
    if (data.nombre !== undefined)
        evento.nombre = data.nombre;
    if (data.descripcion !== undefined)
        evento.descripcion = data.descripcion;
    if (data.imagen !== undefined)
        evento.imagen = data.imagen;
    if (data.draft !== undefined)
        evento.draft = data.draft;
    await em.flush();
    return evento;
};
export const deleteEvento = async (id) => {
    const em = getOrm().em.fork();
    const evento = await em.findOne(Evento, { id });
    if (!evento)
        return false;
    await em.remove(evento).flush();
    return true;
};
