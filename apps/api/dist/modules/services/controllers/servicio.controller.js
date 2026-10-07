import { listServiciosByUsuario, buscarServiciosPorNombre, buscarServiciosPorCategoria, createServicio, updateServicio, deleteServicio } from '../services/servicio.service.js';
import { respondWithError, sendApiError } from '../../../shared/api-error.js';
const serializeServicio = (servicio) => ({
    id: servicio.id,
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    imagen: servicio.imagen,
    draft: servicio.draft,
    creadoEn: servicio.creadoEn,
    categoria: {
        id: servicio.categoria.id,
        nombre: servicio.categoria.nombre
    },
    // Datos de contacto públicos de la empresa dueña del servicio.
    empresa: {
        id: servicio.usuario.id,
        nombre: servicio.usuario.nombre,
        telefono: servicio.usuario.telefono,
        zona: servicio.usuario.zona
    }
});
// ======================================================
// LISTAR SERVICIOS DE UNA EMPRESA
// ======================================================
export const getServicios = async (req, res) => {
    const usuarioId = Number(req.query.usuarioId);
    try {
        const servicios = await listServiciosByUsuario(usuarioId);
        res.json({
            servicios: servicios.map(serializeServicio)
        });
    }
    catch (error) {
        sendApiError(res, error, 'Error al obtener los servicios');
    }
};
// ======================================================
// BUSCAR SERVICIOS PUBLICADOS POR NOMBRE
// ======================================================
export const buscarServicios = async (req, res) => {
    const nombre = String(req.query.nombre ?? '').trim();
    const zona = String(req.query.zona ?? '').trim();
    const empresa = String(req.query.empresa ?? '').trim();
    try {
        const servicios = await buscarServiciosPorNombre(nombre, zona, empresa);
        res.json({
            servicios: servicios.map(serializeServicio)
        });
    }
    catch (error) {
        sendApiError(res, error, 'Error al buscar los servicios');
    }
};
// ======================================================
// BUSCAR SERVICIOS PUBLICADOS POR CATEGORÍA
// ======================================================
export const buscarServiciosCategoria = async (req, res) => {
    const categoriaId = Number(req.params.categoriaId);
    try {
        const servicios = await buscarServiciosPorCategoria(categoriaId);
        res.json({
            servicios: servicios.map(serializeServicio)
        });
    }
    catch (error) {
        sendApiError(res, error, 'Error al buscar los servicios por categoría');
    }
};
// ======================================================
// CREAR SERVICIO
// ======================================================
export const crearServicio = async (req, res) => {
    const { nombre, descripcion, imagen, categoriaId, usuarioId, draft } = req.body;
    try {
        const servicio = await createServicio({
            nombre,
            descripcion,
            imagen,
            categoriaId: Number(categoriaId),
            usuarioId: Number(usuarioId),
            draft
        });
        res.status(201).json({
            message: 'Servicio creado correctamente',
            servicio: serializeServicio(servicio)
        });
    }
    catch (error) {
        sendApiError(res, error, 'Error al crear el servicio');
    }
};
// ======================================================
// ACTUALIZAR SERVICIO
// ======================================================
export const actualizarServicio = async (req, res) => {
    const id = Number(req.params.id);
    const { usuarioId, ...data } = req.body;
    try {
        const servicio = await updateServicio(id, Number(usuarioId), data);
        if (!servicio) {
            return respondWithError(res, 404, 'NOT_FOUND', 'Servicio no encontrado');
        }
        res.json({
            message: 'Servicio actualizado correctamente',
            servicio: serializeServicio(servicio)
        });
    }
    catch (error) {
        sendApiError(res, error, 'Error al actualizar el servicio');
    }
};
// ======================================================
// BORRAR SERVICIO
// ======================================================
export const borrarServicio = async (req, res) => {
    const id = Number(req.params.id);
    const usuarioId = Number(req.query.usuarioId ?? req.body?.usuarioId);
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
        return respondWithError(res, 400, 'VALIDATION_ERROR', 'El parámetro "usuarioId" es requerido y debe ser un entero positivo');
    }
    try {
        const eliminado = await deleteServicio(id, usuarioId);
        if (!eliminado) {
            return respondWithError(res, 404, 'NOT_FOUND', 'Servicio no encontrado');
        }
        res.json({
            message: 'Servicio eliminado correctamente'
        });
    }
    catch (error) {
        sendApiError(res, error, 'Error al eliminar el servicio');
    }
};
