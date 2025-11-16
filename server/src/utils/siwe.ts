import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';

/**
 * Verify a SIWE message and signature
 * @param message - The SIWE message object
 * @param signature - The signature from the wallet
 * @returns The verified wallet address
 */
export async function verifySiweMessage(
  message: string,
  signature: string
): Promise<string> {
  try {
    // Parse the SIWE message
    const siweMessage = new SiweMessage(message);

    // Verify the signature
    const fields = await siweMessage.verify({ signature });

    if (!fields.success) {
      throw new Error('SIWE verification failed');
    }

    // Return the verified address
    return siweMessage.address.toLowerCase();
  } catch (error) {
    console.error('SIWE verification error:', error);
    throw new Error('Invalid signature or message');
  }
}

/**
 * Generate a SIWE message template (helper for frontend)
 * This is typically done on the frontend, but we provide this as a reference
 */
export function generateSiweMessage(
  domain: string,
  address: string,
  statement: string,
  uri: string,
  version: string = '1',
  chainId: number = 11155111 // Sepolia
): string {
  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri,
    version,
    chainId,
    nonce: generateNonce(),
    issuedAt: new Date().toISOString(),
  });

  return message.prepareMessage();
}

/**
 * Generate a cryptographically secure random nonce
 */
export function generateNonce(): string {
  return ethers.hexlify(ethers.randomBytes(16));
}

/**
 * Validate that an address is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Normalize an Ethereum address to lowercase
 */
export function normalizeAddress(address: string): string {
  if (!isValidAddress(address)) {
    throw new Error('Invalid Ethereum address');
  }
  return address.toLowerCase();
}
