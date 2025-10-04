const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupBlockchain() {
  try {
    console.log('🚀 Setting up DataChain blockchain infrastructure...\n');
    
    // Check if Aptos CLI is installed
    try {
      execSync('aptos --version', { stdio: 'pipe' });
      console.log('✅ Aptos CLI is installed');
    } catch (error) {
      console.error('❌ Aptos CLI not found. Please install it first:');
      console.log('curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3');
      process.exit(1);
    }

    // Create .aptos directory if it doesn't exist
    const aptosDir = '.aptos';
    if (!fs.existsSync(aptosDir)) {
      fs.mkdirSync(aptosDir);
    }

    // Generate new account
    console.log('🔑 Generating new Aptos account...');
    const initResult = execSync('aptos init --network testnet --assume-yes', { 
      encoding: 'utf8',
      cwd: '.'
    });
    
    console.log('✅ Account generated successfully');

    // Read the generated config
    const configPath = path.join('.aptos', 'config.yaml');
    if (!fs.existsSync(configPath)) {
      throw new Error('Failed to generate Aptos config');
    }

    const configContent = fs.readFileSync(configPath, 'utf8');
    const addressMatch = configContent.match(/account:\s*([0-9a-fA-Fx]+)/);
    const privateKeyMatch = configContent.match(/private_key:\s*"([^"]+)"/);

    if (!addressMatch || !privateKeyMatch) {
      throw new Error('Failed to parse account information from config');
    }

    const accountAddress = addressMatch[1];
    const privateKey = privateKeyMatch[1];

    console.log(`📍 Account Address: ${accountAddress}`);
    console.log(`🔐 Private Key: ${privateKey.substring(0, 10)}...`);

    // Fund the account
    console.log('💰 Funding account on testnet...');
    try {
      execSync(`aptos account fund-with-faucet --account ${accountAddress} --url https://fullnode.testnet.aptoslabs.com`, {
        stdio: 'inherit'
      });
      console.log('✅ Account funded successfully');
    } catch (error) {
      console.log('⚠️  Faucet funding failed, but continuing with deployment...');
    }

    // Update .env file
    console.log('📝 Updating .env file...');
    const envPath = '.env';
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update environment variables
    const updates = {
      'NEXT_PUBLIC_MODULE_ADDRESS': accountAddress,
      'NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS': accountAddress,
      'NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY': privateKey
    };

    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;
      
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${newLine}`;
      }
    });

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Environment variables updated');

    // Compile and deploy contract
    console.log('🔨 Compiling Move contract...');
    execSync('aptos move compile', { 
      cwd: 'contract',
      stdio: 'inherit'
    });
    console.log('✅ Contract compiled successfully');

    console.log('📤 Publishing contract to testnet...');
    const publishCmd = `aptos move publish --named-addresses message_board_addr=${accountAddress} --assume-yes`;
    
    const publishResult = execSync(publishCmd, { 
      cwd: 'contract',
      encoding: 'utf8'
    });
    
    console.log('✅ Contract published successfully!');
    console.log(publishResult);

    // Test the deployment
    console.log('🧪 Testing contract deployment...');
    try {
      const testResult = execSync(`aptos move view --function-id ${accountAddress}::dataset_registry::get_dataset_count --args address:${accountAddress}`, {
        encoding: 'utf8'
      });
      console.log('✅ Contract is working correctly');
      console.log('Dataset count:', testResult.trim());
    } catch (error) {
      console.log('⚠️  Contract test failed, but deployment completed');
    }

    console.log('\n🎉 Blockchain setup complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Contract Address: ${accountAddress}`);
    console.log(`🌐 Network: testnet`);
    console.log(`🔗 Explorer: https://explorer.aptoslabs.com/account/${accountAddress}?network=testnet`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nNext steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Test the backend: http://localhost:3000/test-backend');
    console.log('3. Upload a dataset: http://localhost:3000/upload');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Aptos CLI is installed');
    console.log('2. Check your internet connection');
    console.log('3. Try running the script again');
    process.exit(1);
  }
}

setupBlockchain();