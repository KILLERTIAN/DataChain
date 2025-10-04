# DataChain Backend Setup Guide

## 🚀 Quick Setup

### 1. Environment Variables Setup

Copy the `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Required Variables:**

```env
# Pinata Configuration (Get from https://pinata.cloud)
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET=your_pinata_secret_key_here
PINATA_JWT=your_pinata_jwt_token_here

# Aptos Configuration
NEXT_PUBLIC_APP_NETWORK=testnet
NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS=your_account_address_here
NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=your_private_key_here
```

### 2. Get Pinata Credentials

1. Go to [Pinata.cloud](https://pinata.cloud) and create an account
2. Navigate to API Keys section
3. Create a new API key with the following permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS` 
   - `unpin`
   - `userPinnedDataTotal`
4. Copy the API Key, Secret, and JWT token to your `.env` file

### 3. Setup Aptos Account

If you don't have an Aptos account:

```bash
# Install Aptos CLI
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Create a new account
aptos init

# Fund your account (testnet)
aptos account fund-with-faucet --account YOUR_ACCOUNT_ADDRESS
```

Copy your account address and private key to the `.env` file.

### 4. Deploy Smart Contract

```bash
# Deploy the dataset registry contract
npm run deploy-contract
```

This will:
- Compile the Move contract
- Deploy it to the Aptos testnet
- Update your `.env` file with the module address

### 5. Test the Backend

Start your development server:

```bash
npm run dev
```

Visit `http://localhost:3000/test-backend` to test all API endpoints.

## 🧪 Testing Individual Components

### Test Pinata Authentication

```bash
curl http://localhost:3000/api/pinata/test
```

Expected response:
```json
{
  "success": true,
  "message": "Authenticated with Pinata",
  "method": "JWT" // or "API_KEYS"
}
```

### Test File Upload

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test-file.txt" \
  -F "name=Test Dataset" \
  -F "description=Test upload"
```

### Test Dataset Registration

```bash
curl -X POST http://localhost:3000/api/register-dataset \
  -H "Content-Type: application/json" \
  -d '{
    "cid": "QmTestCID123",
    "hash": "testhash123",
    "metadata": {
      "name": "Test Dataset",
      "description": "Test"
    },
    "userAddress": "0x1234567890abcdef"
  }'
```

## 🔧 Troubleshooting

### Upload Failing with 500 Error

1. **Check Pinata Credentials:**
   ```bash
   curl http://localhost:3000/api/pinata/test
   ```

2. **Verify Environment Variables:**
   - Make sure `PINATA_API_KEY`, `PINATA_SECRET`, and `PINATA_JWT` are set
   - Check for extra spaces or quotes in the values

3. **Check Console Logs:**
   - Look at the server console for detailed error messages
   - The upload endpoint now includes detailed logging

### Contract Deployment Issues

1. **Check Account Balance:**
   ```bash
   aptos account list --account YOUR_ACCOUNT_ADDRESS
   ```

2. **Verify Network:**
   - Make sure `NEXT_PUBLIC_APP_NETWORK` is set to `testnet`
   - Ensure you're using testnet credentials

3. **Manual Deployment:**
   ```bash
   cd contract
   aptos move publish --named-addresses message_board_addr=YOUR_ADDRESS --private-key YOUR_PRIVATE_KEY --url https://fullnode.testnet.aptoslabs.com
   ```

## 📁 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pinata/test` | GET | Test Pinata authentication |
| `/api/upload` | POST | Upload file to IPFS |
| `/api/register-dataset` | POST | Register dataset on blockchain |
| `/api/dataset/[owner]/[id]` | GET | Get dataset metadata |
| `/api/dataset/[owner]/[id]/file` | GET | Download dataset file |
| `/api/purchase/[owner]/[id]` | POST | Purchase dataset access |

## 🎯 Next Steps

1. **Test the upload flow** at `http://localhost:3000/upload`
2. **Verify file uploads** appear in your Pinata dashboard
3. **Check blockchain transactions** on Aptos Explorer
4. **Integrate with your frontend** components

## 🆘 Need Help?

If you're still having issues:

1. Check the browser console for frontend errors
2. Check the server console for backend errors
3. Verify all environment variables are set correctly
4. Test each API endpoint individually using the test page

The backend is now fully configured with:
- ✅ Pinata IPFS integration
- ✅ Aptos blockchain integration  
- ✅ File upload and hashing
- ✅ Dataset registration
- ✅ Access control system
- ✅ Comprehensive error handling