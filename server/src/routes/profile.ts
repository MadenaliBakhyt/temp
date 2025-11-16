import { Router, Response } from 'express';
import { AuthenticatedRequest, ProfileUpdateRequest, ApiResponse } from '../types';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody, schemas } from '../middleware/validation';
import { uploadAvatarFromDataURL } from '../utils/ipfs';
import { isValidAddress, normalizeAddress } from '../utils/siwe';
import prisma from '../db/client';

const router = Router();

/**
 * GET /profile/:address
 * Get public profile by wallet address
 */
router.get('/:address', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { address } = req.params;

    // Validate address
    if (!isValidAddress(address)) {
      res.status(400).json({
        success: false,
        error: 'Invalid wallet address',
      });
      return;
    }

    const normalizedAddress = normalizeAddress(address);

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
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
        error: 'Profile not found',
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.json(response);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
});

/**
 * GET /profile
 * Get authenticated user's own profile
 */
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
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
        error: 'Profile not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get own profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
});

/**
 * POST /profile
 * Update authenticated user's profile
 */
router.post(
  '/',
  authenticate,
  validateBody(schemas.profileUpdate),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const walletAddress = req.walletAddress!;
      const { nickname, avatarUrl } = req.body as ProfileUpdateRequest;

      // Update user profile
      const user = await prisma.user.update({
        where: { walletAddress },
        data: {
          ...(nickname !== undefined && { nickname }),
          ...(avatarUrl !== undefined && { avatarUrl }),
        },
        select: {
          walletAddress: true,
          nickname: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Profile updated successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
      });
    }
  }
);

/**
 * POST /profile/avatar
 * Upload avatar image (base64 data URL)
 */
router.post(
  '/avatar',
  authenticate,
  validateBody(schemas.avatarUpload),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const walletAddress = req.walletAddress!;
      const { dataUrl } = req.body;

      // Upload to IPFS (or mock storage)
      const result = await uploadAvatarFromDataURL(dataUrl);

      // Update user profile with new avatar URL
      const user = await prisma.user.update({
        where: { walletAddress },
        data: {
          avatarUrl: result.url,
        },
        select: {
          walletAddress: true,
          nickname: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        data: {
          user,
          upload: {
            cid: result.cid,
            url: result.url,
          },
        },
        message: 'Avatar uploaded successfully',
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload avatar',
      });
    }
  }
);

/**
 * DELETE /profile/avatar
 * Remove avatar
 */
router.delete('/avatar', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const walletAddress = req.walletAddress!;

    const user = await prisma.user.update({
      where: { walletAddress },
      data: {
        avatarUrl: null,
      },
      select: {
        walletAddress: true,
        nickname: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
      message: 'Avatar removed successfully',
    });
  } catch (error) {
    console.error('Remove avatar error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove avatar',
    });
  }
});

export default router;
