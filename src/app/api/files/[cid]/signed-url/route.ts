import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

export async function GET(
  request: NextRequest,
  { params }: { params: { cid: string } }
) {
  try {
    const { cid } = params;
    const { searchParams } = new URL(request.url);
    const expires = parseInt(searchParams.get('expires') || '3600'); // Default 1 hour
    const filename = searchParams.get('filename');
    
    // Image optimization parameters for signed URLs
    const width = searchParams.get('width');
    const height = searchParams.get('height');
    const quality = searchParams.get('quality');
    const format = searchParams.get('format');

    if (!cid) {
      return NextResponse.json(
        { success: false, error: 'Missing CID' },
        { status: 400 }
      );
    }

    const pinataJwt = process.env.PINATA_JWT;
    const pinataGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY?.replace('https://', '').replace('/ipfs', '') || 'brown-imaginative-bug-610.mypinata.cloud';

    if (!pinataJwt) {
      return NextResponse.json(
        { success: false, error: 'PINATA_JWT is not set' },
        { status: 500 }
      );
    }

    const pinata = new PinataSDK({
      pinataJwt: pinataJwt,
      pinataGateway: pinataGateway,
    });

    console.log('Generating signed URL for CID:', cid, 'expires in:', expires, 'seconds');

    try {
      // Build query parameters for image optimization
      const queryParams: Record<string, string> = {};
      if (width) queryParams.width = width;
      if (height) queryParams.height = height;
      if (quality) queryParams.quality = quality;
      if (format) queryParams.format = format;
      if (filename) queryParams.filename = filename;

      // Generate signed URL using Pinata SDK
      // Note: This might need to be adjusted based on actual Pinata SDK methods
      const signedUrl = await pinata.gateways.createSignedURL({
        cid: cid,
        expires: expires,
        ...queryParams
      });

      console.log('Signed URL generated successfully:', {
        cid,
        expires,
        hasUrl: !!signedUrl
      });

      return NextResponse.json({
        success: true,
        signedUrl: signedUrl,
        cid: cid,
        expires: expires,
        expiresAt: new Date(Date.now() + expires * 1000).toISOString()
      });

    } catch (sdkError) {
      console.error('Pinata SDK signed URL generation error:', sdkError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to generate signed URL', 
          details: sdkError instanceof Error ? sdkError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Signed URL generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}