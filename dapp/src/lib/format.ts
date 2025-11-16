import { formatUnits, parseUnits } from 'viem';

/**
 * Format wei to display with decimals
 */
export function formatTokenAmount(amount: bigint, decimals: number = 18, maxDecimals: number = 4): string {
  const formatted = formatUnits(amount, decimals);
  const parts = formatted.split('.');

  if (parts.length === 1) return formatted;

  const decimalPart = parts[1].slice(0, maxDecimals);
  return `${parts[0]}.${decimalPart}`;
}

/**
 * Parse display amount to wei
 */
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  try {
    return parseUnits(amount, decimals);
  } catch {
    return 0n;
  }
}

/**
 * Format address to short format
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format transaction hash
 */
export function formatTxHash(hash: string): string {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number | string): string {
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Validate token amount input
 */
export function isValidAmount(amount: string): boolean {
  if (!amount || amount === '') return false;
  const regex = /^\d*\.?\d*$/;
  return regex.test(amount) && parseFloat(amount) > 0;
}
