import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../lib/errors/errors';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Zod validation middleware factory.
 * Validates req[target] against the provided schema.
 *
 * Usage:
 *   router.post('/login', validate(LoginSchema), authController.login)
 *   router.get('/users', validate(PaginationSchema, 'query'), userController.list)
 */
export function validate(schema: AnyZodObject, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = formatZodErrors(result.error);
      return next(new ValidationError('Validation failed', details));
    }

    // Replace with parsed (and potentially transformed) data
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    req[target] = result.data as (typeof req)[typeof target];
    next();
  };
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  return error.issues.reduce(
    (acc, issue) => {
      const key = issue.path.join('.') || 'root';
      acc[key] = acc[key] ? [...acc[key], issue.message] : [issue.message];
      return acc;
    },
    {} as Record<string, string[]>,
  );
}
