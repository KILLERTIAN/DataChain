import { PinataSDK } from 'pinata';

// Initialize Pinata SDK with proper configuration
export function createPinataClient() {
  const pinataJwt = process.env.PINATA_JWT;
  const pinataGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY?.replace('https://', '').replace('/ipfs', '') || 'brown-imaginative-bug-610.mypinata.cloud';

  if (!pinataJwt) {
    throw new Error('PINATA_JWT environment variable is not set');
  }

  return new PinataSDK({
    pinataJwt: pinataJwt,
    pinataGateway: pinataGateway,
  });
}

// Client-side utility for generating file URLs
export function generateFileUrl(cid: string, options?: {
  download?: boolean;
  filename?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}) {
  const params = new URLSearchParams();
  
  if (options?.download) params.set('download', 'true');
  if (options?.filename) params.set('filename', options.filename);
  if (options?.width) params.set('width', options.width.toString());
  if (options?.height) params.set('height', options.height.toString());
  if (options?.quality) params.set('quality', options.quality.toString());
  if (options?.format) params.set('format', options.format);

  const queryString = params.toString();
  return `/api/files/${cid}${queryString ? `?${queryString}` : ''}`;
}

// Client-side utility for generating signed URLs
export async function generateSignedUrl(cid: string, options?: {
  expires?: number;
  filename?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}) {
  const params = new URLSearchParams();
  
  if (options?.expires) params.set('expires', options.expires.toString());
  if (options?.filename) params.set('filename', options.filename);
  if (options?.width) params.set('width', options.width.toString());
  if (options?.height) params.set('height', options.height.toString());
  if (options?.quality) params.set('quality', options.quality.toString());
  if (options?.format) params.set('format', options.format);

  const queryString = params.toString();
  const response = await fetch(`/api/files/${cid}/signed-url${queryString ? `?${queryString}` : ''}`);
  
  if (!response.ok) {
    throw new Error('Failed to generate signed URL');
  }
  
  return response.json();
}

// Direct IPFS gateway URL (for public files)
export function generateDirectIpfsUrl(cid: string) {
  const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://brown-imaginative-bug-610.mypinata.cloud/ipfs';
  return `${gateway}/${cid}`;
}

// Image optimization URL for public files
export function generateOptimizedImageUrl(cid: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}) {
  const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://brown-imaginative-bug-610.mypinata.cloud/ipfs';
  const params = new URLSearchParams();
  
  if (options.width) params.set('img-width', options.width.toString());
  if (options.height) params.set('img-height', options.height.toString());
  if (options.quality) params.set('img-quality', options.quality.toString());
  if (options.format) params.set('img-format', options.format);

  const queryString = params.toString();
  return `${gateway}/${cid}${queryString ? `?${queryString}` : ''}`;
}

// Utility to check if a file is an image
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return imageExtensions.includes(extension);
}

// Utility to get appropriate content type
export function getContentType(filename: string): string {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.json': 'application/json',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.zip': 'application/zip',
    '.tar': 'application/x-tar',
    '.gz': 'application/gzip',
  };

  return contentTypes[extension] || 'application/octet-stream';
}