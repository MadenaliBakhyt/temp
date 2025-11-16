import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  walletAddress?: string;
  userId?: string;
}

export interface LoginRequest {
  message: string;
  signature: string;
}

export interface ProfileUpdateRequest {
  nickname?: string;
  avatarUrl?: string;
}

export interface JWTPayload {
  walletAddress: string;
  iat?: number;
  exp?: number;
}

export interface UserProfile {
  walletAddress: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IPFSUploadResult {
  cid: string;
  url: string;
}
