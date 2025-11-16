import { Address } from 'viem';

export interface Token {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  cap: bigint;
  owner: Address;
}

export interface TokenInfo {
  isListed: boolean;
  tokenPerEth: bigint;
  minEthLiquidity: bigint;
  tokenBalance: bigint;
  ethBalance: bigint;
}

export interface UserProfile {
  walletAddress: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  walletAddress: string | null;
  profile: UserProfile | null;
}

export interface GraphToken {
  id: string;
  name: string;
  symbol: string;
  creator: string;
  totalCreated: string;
}

export interface GraphMarketStat {
  id: string;
  token: GraphToken;
  totalBought: string;
  totalSold: string;
  volumeEth: string;
  volumeToken: string;
}

export interface GraphTrade {
  id: string;
  token: GraphToken;
  buyer?: string;
  seller?: string;
  ethAmount: string;
  tokenAmount: string;
  timestamp: string;
}

export interface GraphUserActivity {
  id: string;
  buys: string;
  sells: string;
  createdCount: string;
}
