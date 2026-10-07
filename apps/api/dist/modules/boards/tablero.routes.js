import { Router } from 'express';
import { getOrm } from '../../config/orm.js';
import { Tablero } from '../../entities/tablero.js';
import { TableroServicio } from '../../entities/tablero-servicio.js';
import { Evento } from '../../entities/evento.js';
import { Servicio } from '../../entities/servicio.js';
import { User } from '../../entities/usuario.js';
import { respondWithError, sendApiError } from '../../shared/api-error.js';
import { validateRequest } from '../../shared/request-validation.js';
import { requestSchemas } from '../../shared/request-schemas.js';
import { ensureOrm } from '../../middlewares/ensure-orm.js';
import { authenticate, ensureActiveUser, requireRoles } from '../../middlewares/authorization.js';
const router = Router();
router.use(authenticate, requireRoles('cliente'));
const serialize = (tablero, servicios = []) => ({
    id: tablero.id,
    nombre: tablero.nombre,
    evento: tablero.evento ? { id: tablero.evento.id, nombre: tablero.evento.nombre } : null,
    fechaCreacion: tablero.fechaCreacion,
    servicios: servicios.map(({ servicio }) => ({
        id: servicio.id, nombre: servicio.nombre, descripcion: servicio.descripcion,
        imagen: servicio.imagen, categoria: { id: servicio.categoria.id, nombre: servicio.categoria.nombre }
    }))
});
router.get('/', ensureOrm, ensureActiveUser, async (req, res) => {
    try {
        const em = getOrm().em.fork();
        const tableros = await em.find(Tablero, { cliente: req.auth.userId }, { populate: ['evento'], orderBy: { fechaCreacion: 'DESC' } });
        const guardados = await em.find(TableroServicio, { tablero: { cliente: req.auth.userId } }, { populate: ['servicio.categoria'] });
        res.json({ tableros: tableros.map(tablero => serialize(tablero, guardados.filter(item => item.tablero.id === tablero.id))) });
    }
    catch (error) {
        console.error('Error al listar tableros:', error);
        sendApiError(res, error, 'Error al obtener los tableros');
    }
});
router.post('/', validateRequest(requestSchemas.createTablero), ensureOrm, ensureActiveUser, async (req, res) => {
    const { nombre, eventoId } = req.body ?? {};
    try {
        const em = getOrm().em.fork();
        const [cliente, evento] = await Promise.all([
            em.findOne(User, { id: req.auth.userId, rol: 'cliente', activo: true }),
            em.findOne(Evento, { id: Number(eventoId), draft: false })
        ]);
        if (!cliente || !evento) {
            respondWithError(res, 404, 'NOT_FOUND', 'Cliente o evento no disponible');
            return;
        }
        const tablero = em.create(Tablero, { nombre: nombre.trim(), cliente, evento, fechaCreacion: new Date() });
        await em.persist(tablero).flush();
        res.status(201).json({ tablero: serialize(tablero) });
    }
    catch (error) {
        console.error('Error al crear tablero:', error);
        sendApiError(res, error, 'Error al crear el tablero');
    }
});
router.get('/:id', validateRequest(requestSchemas.tableroIdParam), ensureOrm, ensureActiveUser, async (req, res) => {
    try {
        const em = getOrm().em.fork();
        const tablero = await em.findOne(Tablero, { id: Number(req.params.id), cliente: req.auth.userId }, { populate: ['evento'] });
        if (!tablero) {
            respondWithError(res, 404, 'NOT_FOUND', 'Tablero no encontrado');
            return;
        }
        const guardados = await em.find(TableroServicio, { tablero: tablero.id }, { populate: ['servicio.categoria'] });
        res.json({ tablero: serialize(tablero, guardados) });
    }
    catch (error) {
        console.error('Error al obtener tablero:', error);
        sendApiError(res, error, 'Error al obtener el tablero');
    }
});
router.put('/:id', validateRequest(requestSchemas.updateTablero), ensureOrm, ensureActiveUser, async (req, res) => {
    const { nombre, eventoId } = req.body ?? {};
    try {
        const em = getOrm().em.fork();
        const tablero = await em.findOne(Tablero, { id: Number(req.params.id), cliente: req.auth.userId }, { populate: ['evento'] });
        if (!tablero) {
            respondWithError(res, 404, 'NOT_FOUND', 'Tablero no encontrado');
            return;
        }
        const evento = await em.findOne(Evento, { id: Number(eventoId), draft: false });
        if (!evento) {
            respondWithError(res, 404, 'NOT_FOUND', 'Evento no disponible');
            return;
        }
        tablero.nombre = nombre.trim();
        tablero.evento = evento;
        await em.flush();
        const guardados = await em.find(TableroServicio, { tablero: tablero.id }, { populate: ['servicio.categoria'] });
        res.json({ tablero: serialize(tablero, guardados) });
    }
    catch (error) {
        console.error('Error al editar tablero:', error);
        sendApiError(res, error, 'Error al editar el tablero');
    }
});
router.delete('/:id', validateRequest(requestSchemas.tableroIdParam), ensureOrm, ensureActiveUser, async (req, res) => {
    try {
        const em = getOrm().em.fork();
        const tablero = await em.findOne(Tablero, { id: Number(req.params.id), cliente: req.auth.userId });
        if (!tablero) {
            respondWithError(res, 404, 'NOT_FOUND', 'Tablero no encontrado');
            return;
        }
        await em.remove(tablero).flush();
        res.status(204).end();
    }
    catch (error) {
        console.error('Error al borrar tablero:', error);
        sendApiError(res, error, 'Error al borrar el tablero');
    }
});
router.post('/:id/servicios', validateRequest(requestSchemas.addServicioToTablero), ensureOrm, ensureActiveUser, async (req, res) => {
    try {
        const em = getOrm().em.fork();
        const tablero = await em.findOne(Tablero, { id: Number(req.params.id), cliente: req.auth.userId });
        if (!tablero) {
            respondWithError(res, 404, 'NOT_FOUND', 'Tablero no encontrado');
            return;
        }
        const servicio = await em.findOne(Servicio, { id: Number(req.body.servicioId), draft: false });
        if (!servicio) {
            respondWithError(res, 404, 'NOT_FOUND', 'Servicio no disponible');
            return;
        }
        const existing = await em.findOne(TableroServicio, { tablero: tablero.id, servicio: servicio.id });
        if (existing) {
            respondWithError(res, 409, 'CONFLICT', 'El servicio ya está en este tablero');
            return;
        }
        await em.persist(em.create(TableroServicio, { tablero, servicio, guardadoEn: new Date() })).flush();
        res.status(201).json({ message: 'Servicio agregado al tablero' });
    }
    catch (error) {
        console.error('Error al guardar servicio:', error);
        sendApiError(res, error, 'Error al guardar el servicio');
    }
});
router.delete('/:id/servicios/:servicioId', validateRequest(requestSchemas.removeServicioFromTablero), ensureOrm, ensureActiveUser, async (req, res) => {
    try {
        const em = getOrm().em.fork();
        const guardado = await em.findOne(TableroServicio, {
            tablero: { id: Number(req.params.id), cliente: req.auth.userId }, servicio: Number(req.params.servicioId)
        });
        if (!guardado) {
            respondWithError(res, 404, 'NOT_FOUND', 'Servicio no encontrado en el tablero');
            return;
        }
        await em.remove(guardado).flush();
        res.status(204).end();
    }
    catch (error) {
        console.error('Error al quitar servicio:', error);
        sendApiError(res, error, 'Error al quitar el servicio');
    }
});
export default router;
