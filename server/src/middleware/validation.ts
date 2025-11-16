import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Middleware to validate request body against a Zod schema
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid request body',
        });
      }
    }
  };
}

/**
 * Validation schemas
 */
export const schemas = {
  login: z.object({
    message: z.string().min(1, 'Message is required'),
    signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/, 'Invalid signature format'),
  }),

  profileUpdate: z.object({
    nickname: z.string().min(1).max(50).optional(),
    avatarUrl: z.string().url().optional().or(z.literal('')),
  }),

  avatarUpload: z.object({
    dataUrl: z.string().regex(/^data:image\/(jpeg|png|gif|webp);base64,/, 'Invalid image data URL'),
  }),
};
