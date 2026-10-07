import { ApiError } from './api-error.js';
export const validateRequest = (schemas) => (req, _res, next) => {
    const issues = [];
    for (const part of ['params', 'query', 'body']) {
        const schema = schemas[part];
        if (!schema)
            continue;
        const result = schema.safeParse(req[part]);
        if (!result.success) {
            issues.push(...result.error.issues.map(({ path, message }) => ({
                field: [part, ...path].join('.'),
                message
            })));
            continue;
        }
        if (part === 'body')
            req.body = result.data;
    }
    if (issues.length) {
        next(new ApiError(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos', { fields: issues }));
        return;
    }
    next();
};
