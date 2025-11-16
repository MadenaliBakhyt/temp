import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyToken } from '../utils/jwt';

/**
 * Middleware to verify JWT token and authenticate requests
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyToken(token);

    if (!payload.walletAddress) {
      res.status(401).json({
        success: false,
        error: 'Invalid token payload',
      });
      return;
    }

    // Attach wallet address to request
    req.walletAddress = payload.walletAddress;

    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Authentication failed',
      });
    }
  }
}

/**
 * Optional authentication - doesn't fail if no token provided
 * but attaches wallet address if valid token exists
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);

      if (payload.walletAddress) {
        req.walletAddress = payload.walletAddress;
      }
    }

    next();
  } catch {
    // Silently fail for optional auth
    next();
  }
}
