import { NextRequest, NextResponse } from 'next/server';
import { DatasetCrypto } from '@/lib/crypto';
import { aptosClient } from '@/utils/aptosClient';
import { Network } from '@aptos-labs/ts-sdk';

async function canUserAccess(
  userAddress: string | null,
  creatorAddress: string,
  datasetId: string
): Promise<boolean> {
  if (!userAddress) return false; // User must be logged in to check access for gated content

  const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
  if (!moduleAddress) {
    console.error('Smart contract module address not configured.');
    return false;
  }

  const aptos = aptosClient();

  try {
    const result = await aptos.view({
      payload: {
        function: `${moduleAddress}::dataset_registry::has_access`,
        typeArguments: [],
        functionArguments: [userAddress, creatorAddress, datasetId],
      },
    });
    return result[0] as boolean;
  } catch (error) {
    console.error('Error checking access on blockchain:', error);
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { owner: string; datasetId: string } }
) {
  try {
    const { owner, datasetId } = params;
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!owner || !datasetId) {
      return NextResponse.json(
        { success: false, error: 'Missing owner or dataset ID' },
        { status: 400 }
      );
    }

    // First, get dataset information to check access control
    const datasetResponse = await fetch(
      `${request.nextUrl.origin}/api/dataset/${owner}/${datasetId}`,
      { method: 'GET' }
    );

    if (!datasetResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }

    const datasetData = await datasetResponse.json();
    const dataset = datasetData.dataset;

    // Check access permissions
    const hasAccess = await canUserAccess(userAddress, owner, datasetId);

    if (!hasAccess) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Access denied',
          gatingInfo: dataset.gatingInfo,
          message: dataset.gatingInfo?.status === 'Private' 
            ? 'This dataset is private' 
            : 'This dataset requires purchase or NFT ownership'
        },
        { status: 403 }
      );
    }

    // Check if file is encrypted
    const isEncrypted = dataset.metadata?.encryption?.encrypted;
    
    if (isEncrypted) {
      // For encrypted files, we must proxy and decrypt
      const ipfsGateway = process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
      const fileUrl = `${ipfsGateway}/${dataset.cid}`;
      
      try {
        console.log('Fetching encrypted file from IPFS:', fileUrl);
        const fileResponse = await fetch(fileUrl);
        
        if (!fileResponse.ok) {
          return NextResponse.json(
            { success: false, error: 'Encrypted file not found on IPFS' },
            { status: 404 }
          );
        }

        const encryptedBuffer = Buffer.from(await fileResponse.arrayBuffer());
        console.log('Encrypted file fetched, size:', encryptedBuffer.length);
        
        // Decrypt the file
        const encryptionInfo = dataset.metadata.encryption;
        if (!userAddress || userAddress !== encryptionInfo.userAddress) {
          return NextResponse.json(
            { success: false, error: 'Access denied: encryption key mismatch' },
            { status: 403 }
          );
        }
        
        console.log('Decrypting file for user:', userAddress);
        const decryptedBuffer = DatasetCrypto.decryptFile(
          encryptedBuffer,
          userAddress,
          encryptionInfo.salt,
          encryptionInfo.iv,
          encryptionInfo.authTag
        );
        
        // Verify file integrity
        const isValid = DatasetCrypto.verifyFileHash(decryptedBuffer, dataset.metadata.originalHash);
        if (!isValid) {
          console.error('File integrity check failed');
          return NextResponse.json(
            { success: false, error: 'File integrity verification failed' },
            { status: 500 }
          );
        }
        
        console.log('File decrypted and verified successfully');
        
        return new NextResponse(new Uint8Array(decryptedBuffer), {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${dataset.name}"`,
            'Cache-Control': 'private, no-cache', // Don't cache decrypted files
            'X-File-Encrypted': 'true',
            'X-File-Verified': 'true'
          },
        });
        
      } catch (decryptError) {
        console.error('Decryption error:', decryptError);
        return NextResponse.json(
          { success: false, error: 'Failed to decrypt file' },
          { status: 500 }
        );
      }
    } else {
      // For unencrypted files, redirect to IPFS gateway
      const ipfsGateway = process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
      const fileUrl = `${ipfsGateway}/${dataset.cid}`;
      return NextResponse.redirect(fileUrl);
    }

    // Option 2: Proxy the file (uncomment if you want to proxy instead of redirect)
    /*
    try {
      const fileResponse = await fetch(fileUrl);
      
      if (!fileResponse.ok) {
        return NextResponse.json(
          { success: false, error: 'File not found on IPFS' },
          { status: 404 }
        );
      }

      const fileBuffer = await fileResponse.arrayBuffer();
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': fileResponse.headers.get('Content-Type') || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${dataset.name}"`,
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      });
    } catch (fetchError) {
      console.error('IPFS fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve file from IPFS' },
        { status: 500 }
      );
    }
    */

  } catch (error) {
    console.error('File access error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}