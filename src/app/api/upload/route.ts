import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { DatasetCrypto } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const PINATA_API_KEY = process.env.PINATA_API_KEY;
    const PINATA_SECRET = process.env.PINATA_SECRET;
    const PINATA_JWT = process.env.PINATA_JWT;

    console.log('Pinata credentials check:', {
      hasApiKey: !!PINATA_API_KEY,
      hasSecret: !!PINATA_SECRET,
      hasJWT: !!PINATA_JWT
    });

    if (!PINATA_API_KEY || !PINATA_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Pinata credentials not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string || file?.name || 'Untitled';
    const description = formData.get('description') as string || '';
    const license = formData.get('license') as string || 'MIT';
    const category = formData.get('category') as string || 'Other';
    const tags = formData.get('tags') as string || '';
    const userAddress = formData.get('userAddress') as string || 'anonymous';
    const encrypt = formData.get('encrypt') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Convert file to buffer and compute hash
    const arrayBuffer = await file.arrayBuffer();
    let fileBuffer = Buffer.from(arrayBuffer);
    const originalHash = DatasetCrypto.generateFileHash(fileBuffer);
    
    let encryptionInfo: any = null;
    
    // Encrypt file if requested and user address provided
    if (encrypt && userAddress !== 'anonymous') {
      console.log('Encrypting file for user:', userAddress);
      const encrypted = DatasetCrypto.encryptFile(fileBuffer, userAddress);
      fileBuffer = encrypted.encryptedData;
      encryptionInfo = {
        salt: encrypted.salt,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        encrypted: true,
        userAddress
      };
      console.log('File encrypted successfully');
    }
    
    const hash = DatasetCrypto.generateFileHash(fileBuffer);
    console.log('File hash computed:', hash);
    console.log('Original hash:', originalHash);

    // Create metadata
    const metadata = {
      name,
      description,
      license,
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean), // Convert to array of strings
      uploadedAt: new Date().toISOString(),
      originalName: file.name,
      size: file.size,
      hash,
      originalHash,
      encryption: encryptionInfo
    };

    // Method 1: Try with JWT token first (recommended by Pinata)
    if (PINATA_JWT) {
      try {
        console.log('Attempting upload with JWT...');
        
        const pinataFormData = new FormData();
        pinataFormData.append('file', new Blob([fileBuffer], { type: file.type }), file.name);
        
        // Add metadata as separate form field
        const pinataMetadata = {
          name: `DataChain-${name}`,
          keyvalues: {
            originalName: file.name,
            description: description,
            license: license,
            category: category,
            hash: hash,
            uploadedAt: new Date().toISOString()
          }
        };
        
        pinataFormData.append('pinataMetadata', JSON.stringify(pinataMetadata));

        const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PINATA_JWT}`,
          },
          body: pinataFormData,
        });

        console.log('Pinata JWT response status:', pinataResponse.status);

        if (pinataResponse.ok) {
          const pinataData = await pinataResponse.json();
          console.log('Pinata JWT upload successful:', pinataData);

          // Store in our data store
          const storedDataset = dataStore.storeDataset({
            creator: 'unknown', // Will be updated when registering
            cid: pinataData.IpfsHash,
            hash,
            name,
            description,
            license,
            category,
            tags: metadata.tags,
            status: 'Public', // Default status
            price: 0,
            size: file.size,
          });

          const response = {
            success: true,
            cid: pinataData.IpfsHash,
            hash,
            size: file.size,
            name,
            metadata,
            pinataData,
            uploadMethod: 'JWT',
            datasetId: storedDataset.id
          };

          return NextResponse.json(response);
        } else {
          const errorText = await pinataResponse.text();
          console.error('Pinata JWT upload error:', pinataResponse.status, errorText);
        }
      } catch (jwtError) {
        console.error('JWT upload failed:', jwtError);
      }
    }

    // Method 2: Fallback to API key method
    console.log('Attempting upload with API keys...');
    
    const pinataFormData = new FormData();
    pinataFormData.append('file', new Blob([fileBuffer], { type: file.type }), file.name);
    
    const pinataMetadata = {
      name: `DataChain-${name}`,
      keyvalues: {
        originalName: file.name,
        description: description,
        license: license,
        category: category,
        hash: hash,
        uploadedAt: new Date().toISOString()
      }
    };
    
    pinataFormData.append('pinataMetadata', JSON.stringify(pinataMetadata));

    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET,
      },
      body: pinataFormData,
    });

    console.log('Pinata API key response status:', pinataResponse.status);

    if (!pinataResponse.ok) {
      const errorData = await pinataResponse.text();
      console.error('Pinata API key upload error:', pinataResponse.status, errorData);
      
      // Try to parse error for more details
      let errorDetails = errorData;
      try {
        const errorJson = JSON.parse(errorData);
        console.error('Pinata error details:', errorJson);
        errorDetails = errorJson.error || errorJson.message || errorData;
      } catch (e) {
        console.error('Raw error response:', errorData);
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to upload to IPFS',
          details: errorDetails,
          status: pinataResponse.status,
          method: 'API_KEYS'
        },
        { status: 500 }
      );
    }

    const pinataData = await pinataResponse.json();
    console.log('Pinata API key upload successful:', pinataData);

    // Store in our data store
    const storedDataset = dataStore.storeDataset({
      creator: 'unknown', // Will be updated when registering
      cid: pinataData.IpfsHash,
      hash,
      name,
      description,
      license,
      category,
      tags: metadata.tags,
      status: 'Public', // Default status
      price: 0,
      size: file.size,
    });

    const response = {
      success: true,
      cid: pinataData.IpfsHash,
      hash,
      size: file.size,
      name,
      metadata,
      pinataData,
      uploadMethod: 'API_KEYS',
      datasetId: storedDataset.id
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload files.' },
    { status: 405 }
  );
}