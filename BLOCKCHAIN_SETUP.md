# DataChain Blockchain Setup Guide

This guide will help you set up the Aptos blockchain integration for your DataChain application.

## Prerequisites

1. **Install Aptos CLI**
   ```bash
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```

2. **Verify Installation**
   ```bash
   aptos --version
   ```

## Quick Setup (Recommended)

Run the automated setup script that will:
- Generate a new Aptos account
- Fund it on testnet
- Deploy the smart contract
- Update your .env file

```bash
npm run setup-blockchain
```

## Manual Setup

If you prefer to set up manually or already have an Aptos account:

### 1. Generate Account (if needed)
```bash
aptos init --network testnet
```

### 2. Fund Account
```bash
aptos account fund-with-faucet --account YOUR_ADDRESS
```

### 3. Update .env File
```env
NEXT_PUBLIC_MODULE_ADDRESS=YOUR_ACCOUNT_ADDRESS
NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS=YOUR_ACCOUNT_ADDRESS
NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=YOUR_PRIVATE_KEY
```

### 4. Deploy Contract
```bash
npm run deploy-contract
```

### 5. Initialize Contract
```bash
npm run init-contract
```

## Verification

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Backend APIs**
   Visit: http://localhost:3000/test-backend

3. **Upload a Dataset**
   Visit: http://localhost:3000/upload

## Contract Functions

The deployed contract includes these main functions:

- `initialize()` - Initialize the dataset registry
- `create_dataset()` - Register a new dataset on blockchain
- `get_dataset()` - Retrieve dataset information
- `get_datasets_by_creator()` - Get all datasets by a creator
- `purchase_access()` - Purchase access to gated datasets
- `has_access()` - Check if user has access to a dataset

## Troubleshooting

### Common Issues

1. **"Aptos CLI not found"**
   - Install Aptos CLI using the command above
   - Make sure it's in your PATH

2. **"Account not funded"**
   - Use the testnet faucet: https://aptoslabs.com/testnet-faucet
   - Or run: `aptos account fund-with-faucet --account YOUR_ADDRESS`

3. **"Contract deployment failed"**
   - Check your account has sufficient APT for gas fees
   - Verify your private key is correct
   - Make sure you're on the right network (testnet)

4. **"500 Internal Server Error" on upload**
   - Check that all environment variables are set correctly
   - Verify the contract is deployed and initialized
   - Check the browser console for detailed error messages

### Environment Variables

Make sure these are set in your `.env` file:

```env
# Network Configuration
NEXT_PUBLIC_APP_NETWORK=testnet

# Blockchain Configuration
NEXT_PUBLIC_MODULE_ADDRESS=0x... # Your deployed contract address
NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS=0x... # Your account address
NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=0x... # Your private key

# Pinata Configuration (for IPFS)
PINATA_API_KEY=your_api_key
PINATA_SECRET=your_secret
PINATA_JWT=your_jwt_token
```

## Security Notes

- Never commit your private key to version control
- Use environment variables for sensitive data
- Consider using a dedicated service account for production
- The current setup uses a service account for demo purposes

## Network Information

- **Testnet Explorer**: https://explorer.aptoslabs.com/?network=testnet
- **Testnet Faucet**: https://aptoslabs.com/testnet-faucet
- **Aptos Documentation**: https://aptos.dev/

## Support

If you encounter issues:

1. Check the console logs in your browser
2. Check the terminal output when running scripts
3. Verify your account has sufficient funds
4. Make sure all environment variables are set correctly

For more help, refer to the [Aptos documentation](https://aptos.dev/) or check the contract source code in `contract/sources/dataset_registry.move`.