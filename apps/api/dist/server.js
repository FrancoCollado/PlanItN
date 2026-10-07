import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';
import authRoutes from './modules/auth/routes/auth.routes.js';
import eventoRoutes from './modules/events/routes/evento.routes.js';
import usuarioRoutes from './modules/users/routes/usuario.routes.js';
import statsRoutes from './modules/stats/routes/stats.routes.js';
import categoriaRoutes from './modules/categories/routes/categoria.routes.js';
import servicioRoutes from './modules/services/routes/servicio.routes.js';
import tableroRoutes from './modules/boards/tablero.routes.js';
import { apiErrorHandler, respondWithError } from './shared/api-error.js';
import { initOrm } from './config/orm.js';
import { connectionInfo } from './config/mikro-orm.config.js';
dotenv.config({ path: path.resolve(import.meta.dirname, '../../../.env') });
if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production')
        throw new Error('JWT_SECRET es obligatorio en producción');
    process.env.JWT_SECRET = randomBytes(32).toString('hex');
    console.warn('JWT_SECRET temporal: las sesiones expirarán al reiniciar la API');
}
const app = express();
const PORT = process.env.PORT || 4000;
// En Vercel el frontend se sirve bajo el mismo dominio, así que CORS sólo se
// habilita si se declaran orígenes externos explícitos.
const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean);
if (corsOrigins?.length) {
    app.use(cors({ origin: corsOrigins }));
}
app.use(express.json());
// Diagnóstico: no toca la base de datos, así que responde aunque la conexión falle.
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        message: 'API de planIt funcionando'
    });
});
// Diagnóstico de la base: informa qué variables se usaron y el error exacto de
// pg. Nunca devuelve la contraseña, sólo su longitud y una huella SHA-256.
app.get('/api/health/db', async (_req, res) => {
    try {
        const orm = await initOrm();
        const [identidad] = await orm.em.getConnection().execute('select current_user, current_database(), inet_server_port() as port');
        res.json({ status: 'ok', conexion: connectionInfo, identidad });
    }
    catch (error) {
        const err = error;
        res.status(500).json({
            status: 'error',
            conexion: connectionInfo,
            error: {
                message: err.message,
                code: err.code ?? err.cause?.code,
                causa: err.cause?.message
            }
        });
    }
});
app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/tableros', tableroRoutes);
app.use('/api', (_req, res) => {
    respondWithError(res, 404, 'NOT_FOUND', 'Ruta de API no encontrada');
});
app.use(apiErrorHandler);
// Vercel ejecuta este proceso y rutea las peticiones al puerto que escucha,
// igual que en local. La conexión a la base se hace por request con ensureOrm.
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
export default app;
