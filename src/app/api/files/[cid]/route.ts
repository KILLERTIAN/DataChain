import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

export async function GET(
  request: NextRequest,
  { params }: { params: { cid: string } }
) {
  try {
    const { cid } = params;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';
    const filename = searchParams.get('filename');

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

    console.log('Accessing file with Pinata SDK:', cid);

    try {
      // Use direct gateway access (as per Pinata docs)
      console.log('Fetching from Pinata gateway:', `https://${pinataGateway}/ipfs/${cid}`);
      const gatewayUrl = `https://${pinataGateway}/ipfs/${cid}`;
      const response = await fetch(gatewayUrl);
      
      if (!response.ok) {
        console.error('Gateway fetch failed:', response.status, response.statusText);
        return NextResponse.json(
          { success: false, error: 'File not found on IPFS' },
          { status: 404 }
        );
      }

      const fileBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'application/octet-stream';

      console.log('File fetched successfully from Pinata gateway:', {
        size: fileBuffer.byteLength,
        contentType,
        cid
      });

      const headers: Record<string, string> = {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year with immutable
        'X-IPFS-CID': cid,
        'X-Gateway': pinataGateway,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      if (download) {
        const downloadFilename = filename || `dataset-${cid.slice(0, 8)}.bin`;
        headers['Content-Disposition'] = `attachment; filename="${downloadFilename}"`;
      }

      return new NextResponse(fileBuffer, { headers });

    } catch (gatewayError) {
      console.error('Pinata gateway fetch error:', gatewayError);
      
      // Fallback to public IPFS gateway
      try {
        console.log('Attempting fallback to public IPFS gateway...');
        const publicGatewayUrl = `https://ipfs.io/ipfs/${cid}`;
        const fallbackResponse = await fetch(publicGatewayUrl);
        
        if (!fallbackResponse.ok) {
          throw new Error(`Public gateway fetch failed: ${fallbackResponse.statusText}`);
        }
        
        const fallbackBuffer = await fallbackResponse.arrayBuffer();
        const fallbackContentType = fallbackResponse.headers.get('content-type') || 'application/octet-stream';
        
        const headers: Record<string, string> = {
          'Content-Type': fallbackContentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-IPFS-CID': cid,
          'X-Fallback': 'public-gateway',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (download) {
          const downloadFilename = filename || `dataset-${cid.slice(0, 8)}.bin`;
          headers['Content-Disposition'] = `attachment; filename="${downloadFilename}"`;
        }

        return new NextResponse(fallbackBuffer, { headers });
        
      } catch (fallbackError) {
        console.error('Public gateway access also failed:', fallbackError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to retrieve file from IPFS', 
            details: gatewayError instanceof Error ? gatewayError.message : 'Unknown error',
            fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error'
          },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('File access error:', error);
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

