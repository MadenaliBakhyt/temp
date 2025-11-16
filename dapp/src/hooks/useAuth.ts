import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { AuthState, UserProfile } from '@/types';
import { login as apiLogin, logout as apiLogout, verifyToken, getOwnProfile } from '@/lib/api';

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    walletAddress: null,
    profile: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && address) {
      verifyAndLoadProfile();
    }
  }, [address]);

  async function verifyAndLoadProfile() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const { walletAddress, user } = await verifyToken();

      if (walletAddress.toLowerCase() === address?.toLowerCase()) {
        setAuthState({
          isAuthenticated: true,
          token,
          walletAddress,
          profile: user,
        });
      } else {
        // Token is for different address
        handleLogout();
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      handleLogout();
    }
  }

  async function handleLogin() {
    if (!address || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to TokenFactory dApp',
        uri: window.location.origin,
        version: '1',
        chainId: 11155111, // Sepolia
        nonce: Math.random().toString(36).substring(2),
      });

      const messageString = message.prepareMessage();

      // Sign message
      const signature = await signMessageAsync({ message: messageString });

      // Login with backend
      const { token, walletAddress, user } = await apiLogin(messageString, signature);

      // Store token
      localStorage.setItem('auth_token', token);

      setAuthState({
        isAuthenticated: true,
        token,
        walletAddress,
        profile: user,
      });
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('auth_token');
      setAuthState({
        isAuthenticated: false,
        token: null,
        walletAddress: null,
        profile: null,
      });
    }
  }

  async function refreshProfile() {
    if (!authState.isAuthenticated) return;

    try {
      const profile = await getOwnProfile();
      setAuthState((prev) => ({ ...prev, profile }));
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  }

  return {
    ...authState,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    refreshProfile,
  };
}
