import { Router, Response } from 'express';
import { AuthenticatedRequest, LoginRequest, ApiResponse } from '../types';
import { verifySiweMessage } from '../utils/siwe';
import { generateToken } from '../utils/jwt';
import { validateBody, schemas } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import prisma from '../db/client';

const router = Router();

/**
 * POST /auth/login
 * Sign in with Ethereum
 */
router.post(
  '/login',
  validateBody(schemas.login),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { message, signature } = req.body as LoginRequest;

      // Verify SIWE message and signature
      const walletAddress = await verifySiweMessage(message, signature);

      // Create or update user in database
      const user = await prisma.user.upsert({
        where: { walletAddress },
        update: {
          updatedAt: new Date(),
        },
        create: {
          walletAddress,
        },
      });

      // Generate JWT token
      const token = generateToken(walletAddress);

      // Store session in database (optional - for session management)
      await prisma.session.create({
        data: {
          walletAddress,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      const response: ApiResponse = {
        success: true,
        data: {
          token,
          walletAddress,
          user: {
            walletAddress: user.walletAddress,
            nickname: user.nickname,
            avatarUrl: user.avatarUrl,
          },
        },
        message: 'Login successful',
      };

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }
);

/**
 * POST /auth/logout
 * Logout and invalidate session
 */
router.post('/logout', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // Delete session from database
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

/**
 * GET /auth/verify
 * Verify current token is valid
 */
router.get('/verify', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const walletAddress = req.walletAddress!;

    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: {
        walletAddress: true,
        nickname: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        walletAddress,
        user,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed',
    });
  }
});

/**
 * GET /auth/nonce
 * Get a nonce for SIWE message (optional - can be generated client-side)
 */
router.get('/nonce', (req: AuthenticatedRequest, res: Response) => {
  const nonce = Math.random().toString(36).substring(2, 15);
  res.json({
    success: true,
    data: { nonce },
  });
});

export default router;
