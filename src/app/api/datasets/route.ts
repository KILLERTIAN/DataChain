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

      if (blockchainDatasets.length > 0) {
        datasets = blockchainDatasets;
        console.log('Using blockchain datasets');
      }
    } catch (error) {
      console.log('Blockchain fetch failed:', error);
    }

    // If no blockchain data, try local dataStore
    if (datasets.length === 0) {
      console.log('No blockchain data, trying local dataStore...');
      datasets = creator
        ? dataStore.getDatasetsByCreator(creator)
        : dataStore.getAllDatasets();
      console.log('Local dataStore datasets:', datasets.length);
    }

    // If still no data, add your known uploaded datasets as fallback
    if (datasets.length === 0 && !creator) {
      console.log('No data found, using fallback datasets...');
      datasets = [
        {
          id: "1",
          name: "Resume",
          creator: "0x6069bfc76f707ec5fff32d1fbced5575eb3069ef94f4ee11dd1be1a3ee5d6a6d",
          description: "om resume",
          category: "Education & Research",
          tags: [],
          license: "MIT",
          size: 29281,
          downloads: Math.floor(Math.random() * 100) + 50,
          views: Math.floor(Math.random() * 500) + 100,
          trustScore: 85 + Math.floor(Math.random() * 15),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          cid: "QmXNT8ps3MAv2FmCNeeXnzuudfQJR7JKMEKwdrsboyerFt",
          hash: "3138f2ac285f249ff0be1239a35279531316381fb08bcc128ef96df352904f75",
          status: "Public",
          price: 0
        },
        {
          id: "2",
          name: "Test Dataset 2",
          creator: "0x6069bfc76f707ec5fff32d1fbced5575eb3069ef94f4ee11dd1be1a3ee5d6a6d",
          description: "Another test dataset from Pinata",
          category: "Other",
          tags: ["test", "demo", "pinata"],
          license: "MIT",
          size: 1024000,
          downloads: Math.floor(Math.random() * 100) + 25,
          views: Math.floor(Math.random() * 500) + 75,
          trustScore: 85 + Math.floor(Math.random() * 15),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          cid: "QmPSHqX677VupRV9YmDxKR2c7pq6DbDya3AzsBBvjPLf6X",
          hash: "07360801a1df327158b068299f9521d6fc0fce9d20f950f19c9eb52403a713cb",
          status: "Public",
          price: 0
        }
      ];
    }

    console.log('Final datasets count:', datasets.length);

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
    const transformedDatasets = paginatedDatasets.map(dataset => ({
      id: dataset.id,
      title: dataset.name,
      creator: dataset.creator,
      trustScore: dataset.trustScore,
      description: dataset.description,
      tags: dataset.tags,
      size: `${(dataset.size / 1024 / 1024).toFixed(2)} MB`,
      downloads: dataset.downloads,
      lastUpdated: dataset.updatedAt.split('T')[0], // Just the date part
      licenseType: dataset.license,
      verified: dataset.trustScore >= 90,
      cid: dataset.cid
    }));

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