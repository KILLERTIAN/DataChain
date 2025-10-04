import { NextRequest, NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      cid, 
      hash, 
      metadata, 
      userAddress,
      gatingInfo = { status: 'Public', price: 0 }
    } = body;

    if (!cid || !hash || !metadata || !userAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Aptos client
    const network = process.env.NEXT_PUBLIC_APP_NETWORK as Network || Network.TESTNET;
    const config = new AptosConfig({ network });
    const aptos = new Aptos(config);

    // For demo purposes, we'll use a service account to register datasets
    // In production, you'd want the user to sign the transaction
    const privateKeyHex = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY;
    const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;

    if (!privateKeyHex || !moduleAddress) {
      return NextResponse.json(
        { success: false, error: 'Smart contract not configured' },
        { status: 500 }
      );
    }

    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    const account = Account.fromPrivateKey({ privateKey });

    // First, try to initialize the registry if it doesn't exist
    try {
      const initPayload = {
        function: `${moduleAddress}::dataset_registry::initialize`,
        typeArguments: [],
        functionArguments: [],
      };

      const initTransaction = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: initPayload,
      });

      await aptos.signAndSubmitTransaction({
        signer: account,
        transaction: initTransaction,
      });
    } catch (initError) {
      // Registry might already be initialized, continue
      console.log('Registry initialization skipped (likely already exists)');
    }

    // Prepare transaction payload for dataset creation
    const payload = {
      function: `${moduleAddress}::dataset_registry::create_dataset`,
      typeArguments: [],
      functionArguments: [
        cid,                    // IPFS CID
        hash,                   // SHA-256 hash
        metadata.name || 'Untitled Dataset',          // Dataset name
        metadata.description || '',   // Description
        metadata.license || 'MIT',       // License
        metadata.category || 'Other',      // Category
        metadata.tags || [],        // Tags as vector<String>
        gatingInfo.status || 'Public',      // Gating status
        gatingInfo.price || 0,              // Price in APT (u64)
      ],
    };

    // Build and submit transaction
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: payload,
    });

    const committedTransaction = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    // Wait for transaction confirmation
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTransaction.hash,
    });

    return NextResponse.json({
      success: true,
      txHash: committedTransaction.hash,
      transaction: executedTransaction,
      datasetInfo: {
        cid,
        hash,
        metadata,
        gatingInfo,
        creator: userAddress,
        registeredAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Dataset registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register dataset on blockchain' },
      { status: 500 }
    );
  }
}