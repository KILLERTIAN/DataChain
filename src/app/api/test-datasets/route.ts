import {  NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

export async function GET() {
  try {
    const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
    const serviceAccount = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS;
    const network = process.env.NEXT_PUBLIC_APP_NETWORK as Network || Network.TESTNET;

    console.log('=== TESTING BLOCKCHAIN DATASETS ===');
    console.log('Module address:', moduleAddress);
    console.log('Service account:', serviceAccount);
    console.log('Network:', network);

    if (!moduleAddress || moduleAddress === '0x1') {
      return NextResponse.json({
        success: false,
        error: 'Blockchain not configured',
        config: { moduleAddress, serviceAccount, network }
      });
    }

    // Initialize Aptos client
    const config = new AptosConfig({ network });
    const aptos = new Aptos(config);

    const results: any = {
      moduleAddress,
      serviceAccount,
      network,
      tests: {}
    };

    // Test 1: Try service account
    if (serviceAccount && serviceAccount !== '0x1') {
      try {
        console.log(`Testing service account: ${serviceAccount}`);
        const datasets = await aptos.view({
          payload: {
            function: `${moduleAddress}::dataset_registry::get_datasets_by_creator`,
            typeArguments: [],
            functionArguments: [serviceAccount],
          },
        });
        
        results.tests.serviceAccount = {
          success: true,
          address: serviceAccount,
          datasets: datasets[0] || [],
          count: (datasets[0] as any[])?.length || 0,
          raw: datasets
        };
        
        console.log(`Service account result:`, datasets);
      } catch (error) {
        results.tests.serviceAccount = {
          success: false,
          address: serviceAccount,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        console.log(`Service account error:`, error);
      }
    }

    // Test 2: Try module address
    try {
      console.log(`Testing module address: ${moduleAddress}`);
      const datasets = await aptos.view({
        payload: {
          function: `${moduleAddress}::dataset_registry::get_datasets_by_creator`,
          typeArguments: [],
          functionArguments: [moduleAddress],
        },
      });
      
      results.tests.moduleAddress = {
        success: true,
        address: moduleAddress,
        datasets: datasets[0] || [],
        count: (datasets[0] as any[])?.length || 0,
        raw: datasets
      };
      
      console.log(`Module address result:`, datasets);
    } catch (error) {
      results.tests.moduleAddress = {
        success: false,
        address: moduleAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.log(`Module address error:`, error);
    }

    // Test 3: Try dataset count
    try {
      const count = await aptos.view({
        payload: {
          function: `${moduleAddress}::dataset_registry::get_dataset_count`,
          typeArguments: [],
          functionArguments: [serviceAccount || moduleAddress],
        },
      });
      results.tests.datasetCount = {
        success: true,
        count: count[0],
        raw: count
      };
      console.log(`Dataset count:`, count);
    } catch (error) {
      results.tests.datasetCount = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.log(`Dataset count error:`, error);
    }

    return NextResponse.json({
      success: true,
      message: 'Blockchain test completed',
      results
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        moduleAddress: process.env.NEXT_PUBLIC_MODULE_ADDRESS,
        serviceAccount: process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS,
        network: process.env.NEXT_PUBLIC_APP_NETWORK
      }
    }, { status: 500 });
  }
}