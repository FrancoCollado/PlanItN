import jwt from 'jsonwebtoken';
import { getOrm } from '../config/orm.js';
import { User } from '../entities/usuario.js';
import { respondWithError } from '../shared/api-error.js';
const accessRoles = ['cliente', 'empresa', 'administrador'];
export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    const secret = process.env.JWT_SECRET;
    if (!token) {
        respondWithError(res, 401, 'UNAUTHENTICATED', 'Iniciá sesión para acceder a este recurso');
        return;
    }
    if (!secret) {
        next(new Error('JWT_SECRET no está configurado'));
        return;
    }
    try {
        const payload = jwt.verify(token, secret);
        if (typeof payload === 'string' ||
            typeof payload.sub !== 'string' ||
            !/^\d+$/.test(payload.sub) ||
            !Number.isSafeInteger(Number(payload.sub)) ||
            Number(payload.sub) <= 0 ||
            !accessRoles.includes(payload.rol)) {
            respondWithError(res, 401, 'UNAUTHENTICATED', 'La sesión no es válida');
            return;
        }
        req.auth = {
            userId: Number(payload.sub),
            role: payload.rol
        };
        next();
    }
    catch {
        respondWithError(res, 401, 'UNAUTHENTICATED', 'La sesión expiró o no es válida');
    }
};
export const requireRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.auth) {
        respondWithError(res, 401, 'UNAUTHENTICATED', 'Iniciá sesión para acceder a este recurso');
        return;
    }
    if (!allowedRoles.includes(req.auth.role)) {
        respondWithError(res, 403, 'FORBIDDEN', 'No tenés permisos para realizar esta operación');
        return;
    }
    next();
};
export const requireOwnUserId = (req, res, next) => {
    const suppliedId = req.query.usuarioId ?? req.body?.usuarioId;
    const userId = Number(suppliedId);
    if (!suppliedId || !Number.isSafeInteger(userId) || userId <= 0) {
        respondWithError(res, 400, 'VALIDATION_ERROR', 'El usuario indicado debe ser un ID entero positivo');
        return;
    }
    if (userId !== req.auth?.userId) {
        respondWithError(res, 403, 'FORBIDDEN', 'No podés acceder a los datos de otro usuario');
        return;
    }
    next();
};
export const ensureActiveUser = async (req, res, next) => {
    try {
        const user = await getOrm().em.fork().findOne(User, { id: req.auth?.userId });
        if (!user || !user.activo || user.rol !== req.auth?.role) {
            respondWithError(res, 403, 'FORBIDDEN', 'La cuenta está inactiva o sus permisos cambiaron');
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
