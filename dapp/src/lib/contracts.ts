import { Address } from 'viem';

export const FACTORY_ADDRESS = (import.meta.env.VITE_FACTORY_ADDRESS || '0x') as Address;
export const SWAP_ADDRESS = (import.meta.env.VITE_SWAP_ADDRESS || '0x') as Address;

export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '11155111');
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';
export const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL || '';

// Contract addresses validation
export function areContractsDeployed(): boolean {
  return FACTORY_ADDRESS !== '0x' && SWAP_ADDRESS !== '0x';
}
