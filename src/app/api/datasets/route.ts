import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    const sortBy = searchParams.get('sortBy') || 'downloads';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('Fetching datasets - creator:', creator);

    // Start with empty datasets array
    let datasets: any[] = [];

    // First, try to fetch from blockchain
    try {
      console.log('Attempting to fetch from blockchain...');
      const blockchainDatasets = await fetchDatasetsFromBlockchain(creator);
      console.log('Blockchain datasets found:', blockchainDatasets.length);
      datasets = [...datasets, ...blockchainDatasets];
    } catch (error) {
      console.log('Blockchain fetch failed:', error);
    }

    // Always include local dataStore datasets
    // Always include local dataStore datasets
    const localDatasets = creator
      ? dataStore.getDatasetsByCreator(creator)
      : dataStore.getAllDatasets();
    console.log('Local dataStore datasets:', localDatasets.length);
    datasets = [...datasets, ...localDatasets];

    // Always try to fetch from Pinata API (if no creator filter)
    if (!creator) {
      console.log('Fetching from Pinata API...');
      try {
        const pinataJwt = process.env.PINATA_JWT;
        if (pinataJwt) {
          const pinListResponse = await fetch('https://api.pinata.cloud/data/pinList?pageLimit=50', {
            headers: {
              'Authorization': `Bearer ${pinataJwt}`,
            },
          });

          if (pinListResponse.ok) {
            const pinataData = await pinListResponse.json();
            if (pinataData.rows && pinataData.rows.length > 0) {
              const pinataDatasets = pinataData.rows.map((pin: any, index: number) => ({
                id: pin.ipfs_pin_hash,
                name: pin.metadata?.name || `Dataset ${index + 1}`,
                creator: 'Pinata Upload',
                description: pin.metadata?.keyvalues?.description || 'Dataset uploaded via Pinata',
                category: pin.metadata?.keyvalues?.category || 'Other',
                tags: pin.metadata?.keyvalues?.tags ? (
                  typeof pin.metadata.keyvalues.tags === 'string'
                    ? JSON.parse(pin.metadata.keyvalues.tags)
                    : pin.metadata.keyvalues.tags
                ) : [],
                license: pin.metadata?.keyvalues?.license || 'Unknown',
                size: pin.size,
                downloads: Math.floor(Math.random() * 100) + 1,
                views: Math.floor(Math.random() * 500) + 1,
                trustScore: 80 + Math.floor(Math.random() * 20),
                createdAt: pin.date_pinned,
                updatedAt: pin.date_pinned,
                cid: pin.ipfs_pin_hash,
                hash: pin.ipfs_pin_hash,
                status: 'Public',
                price: 0,
              }));
              datasets = [...datasets, ...pinataDatasets]; // Append instead of replace
              console.log('Added datasets from Pinata API:', pinataDatasets.length);
            }
          } else {
            const errorText = await pinListResponse.text();
            console.error('Pinata API error:', pinListResponse.status, errorText);
          }
        } else {
          console.log('PINATA_JWT not set, skipping Pinata API.');
        }
      } catch (pinataError) {
        console.error('Error fetching from Pinata API:', pinataError);
      }
    }

    console.log('Final datasets count:', datasets.length);
    console.log('Dataset sources:', {
      blockchain: datasets.filter(d => d.creator !== 'Pinata Upload' && d.creator.startsWith('0x')).length,
      pinata: datasets.filter(d => d.creator === 'Pinata Upload').length,
      local: datasets.filter(d => d.creator !== 'Pinata Upload' && !d.creator.startsWith('0x')).length
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      datasets = datasets.filter(dataset =>
        dataset.name.toLowerCase().includes(searchLower) ||
        dataset.description.toLowerCase().includes(searchLower) ||
        dataset.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply tags filter
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
      datasets = datasets.filter(dataset =>
        tagList.some(tag =>
          dataset.tags.some((datasetTag: string) =>
            datasetTag.toLowerCase().includes(tag)
          )
        )
      );
    }

    // Sort datasets
    datasets.sort((a, b) => {
      switch (sortBy) {
        case 'downloads':
          return b.downloads - a.downloads;
        case 'trustScore':
          return b.trustScore - a.trustScore;
        case 'views':
          return b.views - a.views;
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'size':
          return b.size - a.size;
        default:
          return b.downloads - a.downloads;
      }
    });

    // Apply pagination
    const paginatedDatasets = datasets.slice(offset, offset + limit);

    // Transform for frontend
    const transformedDatasets = paginatedDatasets.map(dataset => {
      try {
        return {
          id: dataset.id,
          title: dataset.name || dataset.title || 'Untitled Dataset',
          creator: dataset.creator,
          trustScore: dataset.trustScore || 85,
          description: dataset.description || '',
          tags: dataset.tags || [],
          size: dataset.size ? `${(dataset.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
          downloads: dataset.downloads || 0,
          lastUpdated: dataset.updatedAt ? dataset.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
          licenseType: dataset.license || 'Unknown',
          verified: (dataset.trustScore || 85) >= 90,
          cid: dataset.cid || dataset.hash
        };
      } catch (error) {
        console.error('Error transforming dataset:', dataset, error);
        return null;
      }
    }).filter(Boolean);

    // Get statistics
    const stats = dataStore.getStats();

    return NextResponse.json({
      success: true,
      datasets: transformedDatasets,
      pagination: {
        total: datasets.length,
        limit,
        offset,
        hasMore: offset + limit < datasets.length
      },
      stats
    });

  } catch (error) {
    console.error('Datasets API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve datasets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function fetchDatasetsFromBlockchain(creator?: string | null) {
  try {
    const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
    if (!moduleAddress || moduleAddress === '0x1') {
      console.log('Blockchain not configured, using local data');
      return [];
    }

    console.log('Fetching datasets from blockchain...');
    console.log('Module address:', moduleAddress);
    console.log('Creator filter:', creator);

    // Initialize Aptos client
    const network = process.env.NEXT_PUBLIC_APP_NETWORK as Network || Network.TESTNET;
    const config = new AptosConfig({ network });
    const aptos = new Aptos(config);

    let allDatasets: any[] = [];

    if (creator) {
      // Fetch datasets for specific creator
      try {
        console.log(`Fetching datasets for creator: ${creator}`);
        const datasets = await aptos.view({
          payload: {
            function: `${moduleAddress}::dataset_registry::get_datasets_by_creator`,
            typeArguments: [],
            functionArguments: [creator],
          },
        });
        allDatasets = datasets[0] as any[] || [];
        console.log(`Found ${allDatasets.length} datasets for creator ${creator}`);
      } catch (error) {
        console.log(`No datasets found for creator ${creator}:`, error);
      }
    } else {
      // For explore page, we need to fetch from the service account that registers datasets
      // This is where your datasets are actually stored
      const serviceAccount = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS;

      if (serviceAccount && serviceAccount !== '0x1') {
        try {
          console.log(`Fetching datasets from service account: ${serviceAccount}`);
          const datasets = await aptos.view({
            payload: {
              function: `${moduleAddress}::dataset_registry::get_datasets_by_creator`,
              typeArguments: [],
              functionArguments: [serviceAccount],
            },
          });
          allDatasets = datasets[0] as any[] || [];
          console.log(`Found ${allDatasets.length} datasets in service account registry`);
        } catch (error) {
          console.log('No datasets found in service account registry:', error);
        }
      }

      // Also try the module address as fallback
      if (allDatasets.length === 0) {
        try {
          console.log(`Fetching datasets from module address: ${moduleAddress}`);
          const datasets = await aptos.view({
            payload: {
              function: `${moduleAddress}::dataset_registry::get_datasets_by_creator`,
              typeArguments: [],
              functionArguments: [moduleAddress],
            },
          });
          allDatasets = datasets[0] as any[] || [];
          console.log(`Found ${allDatasets.length} datasets in module registry`);
        } catch (error) {
          console.log('No datasets found in module registry:', error);
        }
      }
    }

    console.log('Raw datasets from blockchain:', allDatasets);

    // Transform blockchain data to match our frontend format
    const transformedDatasets = allDatasets.map((dataset: any, index: number) => {
      console.log(`Transforming dataset ${index}:`, dataset);

      let tags = [];
      try {
        if (dataset.tags && typeof dataset.tags === 'string') {
          tags = JSON.parse(dataset.tags);
        } else if (Array.isArray(dataset.tags)) {
          tags = dataset.tags;
        }
      } catch (e) {
        console.log('Failed to parse tags:', dataset.tags);
        tags = [];
      }

      return {
        id: dataset.id || (index + 1).toString(),
        name: dataset.name || 'Untitled Dataset',
        creator: dataset.creator || moduleAddress,
        description: dataset.description || '',
        category: dataset.category || 'Other',
        tags: tags,
        license: dataset.license || 'MIT',
        size: 1024 * 1024, // Default 1MB, we don't store size on-chain
        downloads: Math.floor(Math.random() * 1000) + 100, // Mock downloads for now
        views: Math.floor(Math.random() * 5000) + 500, // Mock views
        trustScore: 85 + Math.floor(Math.random() * 15), // Mock trust score 85-100
        createdAt: new Date(parseInt(dataset.created_at) * 1000).toISOString(),
        updatedAt: new Date(parseInt(dataset.updated_at) * 1000).toISOString(),
        cid: dataset.cid,
        hash: dataset.hash,
        status: dataset.status || 'Public',
        price: parseInt(dataset.price) || 0
      };
    });

    console.log('Transformed datasets:', transformedDatasets);
    return transformedDatasets;

  } catch (error) {
    console.error('Error fetching from blockchain:', error);
    return [];
  }
}