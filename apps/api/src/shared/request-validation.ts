import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from './api-error.js';

type RequestPart = 'body' | 'params' | 'query';
type RequestSchemas = Partial<Record<RequestPart, ZodType>>;

export const validateRequest = (schemas: RequestSchemas): RequestHandler => (req, _res, next) => {
  const issues: Array<{ field: string; message: string }> = [];

  for (const part of ['params', 'query', 'body'] as const) {
    const schema = schemas[part];
    if (!schema) continue;

    const result = schema.safeParse(req[part]);
    if (!result.success) {
      issues.push(...result.error.issues.map(({ path, message }) => ({
        field: [part, ...path].join('.'),
        message
      })));
      continue;
    }

    if (part === 'body') req.body = result.data;
  }

  if (issues.length) {
    next(new ApiError(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos', { fields: issues }));
    return;
  }

  next();
};