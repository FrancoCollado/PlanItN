import { initOrm } from '../config/orm.js';
export const ensureOrm = async (_req, _res, next) => {
    try {
        await initOrm();
        next();
    }
    catch (error) {
        next(error);
    }
};
