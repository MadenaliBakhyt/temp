import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { IPFSUploadResult } from '../types';

const IPFS_MOCK = process.env.IPFS_MOCK === 'true';
const STORAGE_PATH = process.env.IPFS_STORAGE_PATH || './uploads';

/**
 * Mock IPFS upload for local development
 * In production, replace with real IPFS client (Pinata, Infura, Web3.Storage, etc.)
 */
export async function uploadToIPFS(
  fileBuffer: Buffer,
  filename: string
): Promise<IPFSUploadResult> {
  if (IPFS_MOCK) {
    return mockIPFSUpload(fileBuffer, filename);
  }

  // Real IPFS implementation would go here
  // Example with Pinata:
  /*
  const FormData = require('form-data');
  const axios = require('axios');

  const formData = new FormData();
  formData.append('file', fileBuffer, filename);

  const response = await axios.post(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    formData,
    {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'pinata_api_key': process.env.IPFS_API_KEY,
        'pinata_secret_api_key': process.env.IPFS_API_SECRET,
      },
    }
  );

  return {
    cid: response.data.IpfsHash,
    url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
  };
  */

  throw new Error('Real IPFS upload not implemented. Set IPFS_MOCK=true to use mock storage.');
}

/**
 * Mock IPFS upload - stores files locally and returns a fake CID
 * This is for development/testing purposes only
 */
function mockIPFSUpload(fileBuffer: Buffer, filename: string): IPFSUploadResult {
  // Ensure storage directory exists
  if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
  }

  // Generate a fake CID based on file hash
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  const fakeCID = `Qm${hash.substring(0, 44)}`; // IPFS CIDs start with Qm

  // Save file locally
  const ext = path.extname(filename);
  const localPath = path.join(STORAGE_PATH, `${fakeCID}${ext}`);
  fs.writeFileSync(localPath, fileBuffer);

  console.log(`[Mock IPFS] File uploaded: ${localPath}`);

  // Return mock result
  return {
    cid: fakeCID,
    url: `/uploads/${fakeCID}${ext}`, // Local URL
  };
}

/**
 * Upload avatar from base64 data URL
 */
export async function uploadAvatarFromDataURL(dataUrl: string): Promise<IPFSUploadResult> {
  // Parse data URL
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid data URL format');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  // Validate image type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(mimeType)) {
    throw new Error('Invalid image type. Supported: JPEG, PNG, GIF, WebP');
  }

  // Convert to buffer
  const buffer = Buffer.from(base64Data, 'base64');

  // Validate size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (buffer.length > maxSize) {
    throw new Error('Image too large. Maximum size: 5MB');
  }

  // Generate filename
  const ext = mimeType.split('/')[1];
  const filename = `avatar-${Date.now()}.${ext}`;

  return uploadToIPFS(buffer, filename);
}

/**
 * Delete file from mock storage
 * In production, you might want to unpin from IPFS
 */
export async function deleteFromIPFS(cid: string): Promise<void> {
  if (IPFS_MOCK) {
    // Find and delete local file
    const files = fs.readdirSync(STORAGE_PATH);
    const file = files.find((f) => f.startsWith(cid));

    if (file) {
      const filePath = path.join(STORAGE_PATH, file);
      fs.unlinkSync(filePath);
      console.log(`[Mock IPFS] File deleted: ${filePath}`);
    }
  }
  // Real IPFS unpin would go here
}

/**
 * Helper to validate and extract CID from URL
 */
export function extractCID(url: string): string | null {
  const cidRegex = /Qm[a-zA-Z0-9]{44}/;
  const match = url.match(cidRegex);
  return match ? match[0] : null;
}
