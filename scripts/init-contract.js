const { execSync } = require('child_process');
const fs = require('fs');

async function initContract() {
  try {
    console.log('🔧 Initializing DataChain contract...\n');
    
    // Check environment variables
    const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
    const privateKey = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY;
    
    if (!moduleAddress || !privateKey || moduleAddress === '0x1' || privateKey === '0x1') {
      console.log('❌ Blockchain not configured. Please run setup first:');
      console.log('npm run setup-blockchain');
      process.exit(1);
    }

    console.log(`📍 Module Address: ${moduleAddress}`);
    console.log(`🌐 Network: ${process.env.NEXT_PUBLIC_APP_NETWORK || 'testnet'}`);

    // Initialize the registry on the contract
    console.log('🚀 Initializing dataset registry...');
    
    const initCmd = `aptos move run --function-id ${moduleAddress}::dataset_registry::initialize --assume-yes`;
    
    try {
      const result = execSync(initCmd, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ Registry initialized successfully');
    } catch (error) {
      if (error.message.includes('ALREADY_INITIALIZED') || error.message.includes('already exists')) {
        console.log('✅ Registry already initialized');
      } else {
        console.log('⚠️  Registry initialization failed, but contract is deployed');
        console.log('Error:', error.message);
      }
    }

    // Test the contract
    console.log('🧪 Testing contract functions...');
    try {
      const testResult = execSync(`aptos move view --function-id ${moduleAddress}::dataset_registry::get_dataset_count --args address:${moduleAddress}`, {
        encoding: 'utf8'
      });
      console.log('✅ Contract is working correctly');
      console.log(`📊 Current dataset count: ${testResult.trim()}`);
    } catch (error) {
      console.log('⚠️  Contract test failed:', error.message);
    }

    console.log('\n🎉 Contract initialization complete!');
    console.log('You can now:');
    console.log('1. Test the backend: http://localhost:3000/test-backend');
    console.log('2. Upload datasets: http://localhost:3000/upload');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config();
initContract();