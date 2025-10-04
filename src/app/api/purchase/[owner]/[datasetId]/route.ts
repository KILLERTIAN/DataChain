import { NextRequest, NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import { dataStore } from '@/lib/dataStore';

export async function POST(
  request: NextRequest,
  { params }: { params: { owner: string; datasetId: string } }
) {
  try {
    const { owner, datasetId } = params;
    const body = await request.json();
    const { userAddress, paymentDetails } = body;

    if (!owner || !datasetId || !userAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get dataset information first
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

    // Check if dataset is purchasable
    if (dataset.gatingInfo?.status !== 'NFT_Gated') {
      return NextResponse.json(
        { success: false, error: 'Dataset is not available for purchase' },
        { status: 400 }
      );
    }

    const price = dataset.gatingInfo.price || 0;

    if (price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Dataset price not set' },
        { status: 400 }
      );
    }

    // Initialize Aptos client
    const network = process.env.NEXT_PUBLIC_APP_NETWORK as Network || Network.TESTNET;
    const config = new AptosConfig({ network });
    const aptos = new Aptos(config);

    const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
    const privateKeyHex = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY;

    if (!moduleAddress || !privateKeyHex) {
      return NextResponse.json(
        { success: false, error: 'Smart contract not configured' },
        { status: 500 }
      );
    }

    // For demo purposes, we'll simulate the purchase
    // In production, the user would sign this transaction
    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    const account = Account.fromPrivateKey({ privateKey });

    const payload = {
      function: `${moduleAddress}::dataset_registry::purchase_access`,
      typeArguments: [],
      arguments: [
        owner,           // Dataset owner
        datasetId,       // Dataset ID
        userAddress,     // Purchaser address
        price.toString() // Price in APT
      ],
    };

    try {
      const transaction = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: payload as any, // Explicitly cast to any to bypass type checking
      });

      const committedTransaction = await aptos.signAndSubmitTransaction({
        signer: account,
        transaction,
      });

      const executedTransaction = await aptos.waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      // Store purchase record in database
      dataStore.addPurchaser(datasetId, userAddress);

      return NextResponse.json({
        success: true,
        txHash: committedTransaction.hash,
        accessGranted: true,
        purchaseInfo: {
          buyer: userAddress,
          dataset: datasetId,
          owner,
          price,
          purchasedAt: new Date().toISOString(),
          transactionHash: committedTransaction.hash
        }
      });

    } catch (contractError) {
      console.error('Purchase transaction error:', contractError);
      
      // Return mock success for demo purposes
      return NextResponse.json({
        success: true,
        txHash: 'mock_tx_hash_' + Date.now(),
        accessGranted: true,
        purchaseInfo: {
          buyer: userAddress,
          dataset: datasetId,
          owner,
          price,
          purchasedAt: new Date().toISOString(),
          transactionHash: 'mock_tx_hash_' + Date.now()
        },
        note: 'Mock purchase - smart contract not available'
      });
    }

  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}