import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { cid: string } }
) {
  try {
    const { cid } = params;
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';

    if (!cid) {
      return NextResponse.json(
        { success: false, error: 'Missing CID' },
        { status: 400 }
      );
    }

    // Your Pinata gateway URL
    const ipfsGateway = process.env.IPFS_GATEWAY || 'https://brown-imaginative-bug-610.mypinata.cloud/ipfs';
    const fileUrl = `${ipfsGateway}/${cid}`;

    console.log('Accessing file:', fileUrl);

    try {
      const fileResponse = await fetch(fileUrl);
      
      if (!fileResponse.ok) {
        console.error('IPFS fetch failed:', fileResponse.status, fileResponse.statusText);
        return NextResponse.json(
          { success: false, error: 'File not found on IPFS', status: fileResponse.status },
          { status: 404 }
        );
      }

      const fileBuffer = await fileResponse.arrayBuffer();
      const contentType = fileResponse.headers.get('Content-Type') || 'application/octet-stream';
      
      console.log('File fetched successfully:', {
        size: fileBuffer.byteLength,
        contentType,
        cid
      });

      const headers: Record<string, string> = {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'X-IPFS-CID': cid,
      };

      if (download) {
        headers['Content-Disposition'] = `attachment; filename="${cid}"`;
      }

      return new NextResponse(fileBuffer, { headers });

    } catch (fetchError) {
      console.error('IPFS fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve file from IPFS', details: fetchError instanceof Error ? fetchError.message : 'Unknown error' },
        { status: 500 }
      );
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

// Required for static export
export async function generateStaticParams() {
  return [];
}