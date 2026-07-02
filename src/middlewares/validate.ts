import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed.',
                errors: (error as any).errors
            });
        }
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
