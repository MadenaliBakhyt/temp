import axios from 'axios';
import { BACKEND_URL } from './contracts';
import { UserProfile } from '@/types';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * SIWE login
 */
export async function login(message: string, signature: string): Promise<{
  token: string;
  walletAddress: string;
  user: UserProfile;
}> {
  const response = await api.post('/auth/login', { message, signature });
  return response.data.data;
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

/**
 * Verify token
 */
export async function verifyToken(): Promise<{
  walletAddress: string;
  user: UserProfile;
}> {
  const response = await api.get('/auth/verify');
  return response.data.data;
}

/**
 * Get profile by address
 */
export async function getProfile(address: string): Promise<UserProfile> {
  const response = await api.get(`/profile/${address}`);
  return response.data.data;
}

/**
 * Get own profile
 */
export async function getOwnProfile(): Promise<UserProfile> {
  const response = await api.get('/profile');
  return response.data.data;
}

/**
 * Update profile
 */
export async function updateProfile(data: {
  nickname?: string;
  avatarUrl?: string;
}): Promise<UserProfile> {
  const response = await api.post('/profile', data);
  return response.data.data;
}

/**
 * Upload avatar
 */
export async function uploadAvatar(dataUrl: string): Promise<{
  user: UserProfile;
  upload: { cid: string; url: string };
}> {
  const response = await api.post('/profile/avatar', { dataUrl });
  return response.data.data;
}

/**
 * Delete avatar
 */
export async function deleteAvatar(): Promise<UserProfile> {
  const response = await api.delete('/profile/avatar');
  return response.data.data;
}

export default api;
