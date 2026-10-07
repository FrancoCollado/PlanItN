import { getAdminStats, getBusinessStats } from '../services/stats.service.js';
import { sendApiError } from '../../../shared/api-error.js';
export const getAdminDashboardStats = async (_req, res) => {
    try {
        const stats = await getAdminStats();
        res.json(stats);
    }
    catch (error) {
        sendApiError(res, error, 'Error al obtener las estadísticas');
    }
};
export const getBusinessDashboardStats = async (req, res) => {
    const usuarioId = Number(req.query.usuarioId);
    try {
        const stats = await getBusinessStats(usuarioId);
        res.json(stats);
    }
    catch (error) {
        sendApiError(res, error, 'Error al obtener las estadísticas');
    }
};
