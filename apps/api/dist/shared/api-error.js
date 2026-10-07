import { ZodError } from 'zod';
export class ApiError extends Error {
    status;
    code;
    details;
    constructor(status, code, message, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        this.name = 'ApiError';
    }
}
const getNestedError = (error) => {
    if (!error || typeof error !== 'object')
        return undefined;
    return error;
};
const getPostgresCode = (error) => {
    const visited = new Set();
    let current = error;
    while (current && !visited.has(current)) {
        visited.add(current);
        const record = getNestedError(current);
        if (!record)
            return undefined;
        if (typeof record.code === 'string' && /^\d{5}$/.test(record.code))
            return record.code;
        current = record.cause ?? record.driverException;
    }
    return undefined;
};
const getRequestError = (error) => {
    if (error instanceof ApiError)
        return error;
    if (error instanceof ZodError) {
        return new ApiError(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos', {
            fields: error.issues.map(({ path, message }) => ({ field: path.join('.'), message }))
        });
    }
    const record = getNestedError(error);
    if (record?.type === 'entity.parse.failed') {
        return new ApiError(400, 'BAD_REQUEST', 'El cuerpo de la petición debe contener JSON válido');
    }
    if (record?.type === 'entity.too.large') {
        return new ApiError(413, 'PAYLOAD_TOO_LARGE', 'El cuerpo de la petición es demasiado grande');
    }
    const postgresCode = getPostgresCode(error);
    if (postgresCode === '23505') {
        return new ApiError(409, 'CONFLICT', 'Ya existe un registro con esos datos');
    }
    if (postgresCode === '23503') {
        return new ApiError(409, 'CONFLICT', 'La operación entra en conflicto con datos relacionados');
    }
    return undefined;
};
export const sendApiError = (res, error, fallbackMessage) => {
    const apiError = getRequestError(error) ?? new ApiError(500, 'INTERNAL_SERVER_ERROR', fallbackMessage ?? 'Error interno del servidor');
    if (apiError.status >= 500) {
        console.error('Error no controlado en la API:', error);
    }
    return res.status(apiError.status).json({
        error: apiError.message,
        code: apiError.code,
        ...(apiError.details === undefined ? {} : { details: apiError.details })
    });
};
export const respondWithError = (res, status, code, message, details) => sendApiError(res, new ApiError(status, code, message, details));
export const apiErrorHandler = (error, _req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }
    sendApiError(res, error);
};
