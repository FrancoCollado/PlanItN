import { listEmpresasActivas, listUsuariosByRol, setUsuarioActivo } from '../services/usuario.service.js';
import { respondWithError, sendApiError } from '../../../shared/api-error.js';
// Endpoint público: expone sólo los datos de contacto que el cliente ya ve en las
// cards de servicios, nunca email, CUIT ni estado de la cuenta.
export const getEmpresas = async (_req, res) => {
    try {
        const empresas = await listEmpresasActivas();
        res.json({
            empresas: empresas.map((e) => ({
                id: e.id,
                nombre: e.nombre,
                zona: e.zona,
                telefono: e.telefono
            }))
        });
    }
    catch (error) {
        sendApiError(res, error, 'Error al obtener las empresas');
    }
};
export const getUsuarios = async (req, res) => {
    const rol = typeof req.query.rol === 'string' ? req.query.rol : undefined;
    try {
        const usuarios = await listUsuariosByRol(rol);
        res.json({
            usuarios: usuarios.map((u) => ({
                id: u.id,
                nombre: u.nombre,
                email: u.email,
                rol: u.rol,
                zona: u.zona,
                cuit: u.cuit,
                telefono: u.telefono,
                activo: u.activo,
                creadoEn: u.creadoEn
            }))
        });
    }
    catch (error) {
        sendApiError(res, error, 'Error al obtener los usuarios');
    }
};
export const patchUsuarioActivo = async (req, res) => {
    const id = Number(req.params.id);
    const { activo } = req.body;
    try {
        const usuario = await setUsuarioActivo(id, activo);
        if (!usuario) {
            return respondWithError(res, 404, 'NOT_FOUND', 'Usuario no encontrado');
        }
        res.json({
            message: activo ? 'Usuario reactivado correctamente' : 'Usuario suspendido correctamente',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                activo: usuario.activo
            }
        });
    }
    catch (error) {
        sendApiError(res, error, 'Error al actualizar el usuario');
    }
};
