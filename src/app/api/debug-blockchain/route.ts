import { NextRequest, NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

export async function GET(request: NextRequest) {
  try {
    const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
    const serviceAccount = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS;
    const network = process.env.NEXT_PUBLIC_APP_NETWORK as Network || Network.TESTNET;

    console.log('Debug info:');
    console.log('Module address:', moduleAddress);
    console.log('Service account:', serviceAccount);
    console.log('Network:', network);

    if (!moduleAddress || moduleAddress === '0x1') {
      return NextResponse.json({
        success: false,
        error: 'Blockchain not configured',
        debug: {
          moduleAddress,
          serviceAccount,
          network
        }
      });
    }

    // Initialize Aptos client
    const config = new AptosConfig({ network });
    const aptos = new Aptos(config);

    const results: any = {
      moduleAddress,
      serviceAccount,
      network,
      datasets: {}
    };

    // Try to fetch from service account
    if (serviceAccount && serviceAccount !== '0x1') {
      try {
        console.log(`Checking service account: ${serviceAccount}`);
        const datasets = await aptos.view({
          payload: {
            function: `${moduleAddress}::dataset_registry::get_datasets_by_creator`,
            typeArguments: [],
            functionArguments: [serviceAccount],
          },
        });
        results.datasets.serviceAccount = {
          address: serviceAccount,
          datasets: datasets[0] || [],
          count: (datasets[0] as any[])?.length || 0
        };
        console.log(`Service account datasets:`, datasets[0]);
      } catch (error) {
        results.datasets.serviceAccount = {
          address: serviceAccount,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        console.log(`Service account error:`, error);
      }
    }

    // Try to fetch from module address
    try {
      console.log(`Checking module address: ${moduleAddress}`);
      const datasets = await aptos.view({
        payload: {
          function: `${moduleAddress}::dataset_registry::get_datasets_by_creator`,
          typeArguments: [],
          functionArguments: [moduleAddress],
        },
      });
      results.datasets.moduleAddress = {
        address: moduleAddress,
        datasets: datasets[0] || [],
        count: (datasets[0] as any[])?.length || 0
      };
      console.log(`Module address datasets:`, datasets[0]);
    } catch (error) {
      results.datasets.moduleAddress = {
        address: moduleAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.log(`Module address error:`, error);
    }

    // Try to get dataset count
    try {
      const count = await aptos.view({
        payload: {
          function: `${moduleAddress}::dataset_registry::get_dataset_count`,
          typeArguments: [],
          functionArguments: [serviceAccount || moduleAddress],
        },
      });
      results.datasetCount = count[0];
      console.log(`Dataset count:`, count[0]);
    } catch (error) {
      results.datasetCountError = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Dataset count error:`, error);
    }

    return NextResponse.json({
      success: true,
      debug: results
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        moduleAddress: process.env.NEXT_PUBLIC_MODULE_ADDRESS,
        serviceAccount: process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS,
        network: process.env.NEXT_PUBLIC_APP_NETWORK
      }
    }, { status: 500 });
  }
}