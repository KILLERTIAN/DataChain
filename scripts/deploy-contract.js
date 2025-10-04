const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deployContract() {
  try {
    console.log('🚀 Deploying DataChain smart contract...');
    
    // Check if environment variables are set
    const requiredEnvVars = [
      'NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS',
      'NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY',
      'NEXT_PUBLIC_APP_NETWORK'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars.join(', '));
      console.log('Please set these in your .env file');
      process.exit(1);
    }

    const network = process.env.NEXT_PUBLIC_APP_NETWORK || 'testnet';
    const accountAddress = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS;
    const privateKey = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY;
    
    console.log(`📡 Network: ${network}`);
    console.log(`👤 Publisher: ${accountAddress}`);
    
    // Compile the contract
    console.log('🔨 Compiling contract...');
    execSync('aptos move compile', { 
      cwd: 'contract',
      stdio: 'inherit'
    });
    
    // Publish the contract
    console.log('📤 Publishing contract...');
    const publishCmd = `aptos move publish --named-addresses message_board_addr=${accountAddress} --private-key ${privateKey} --url https://fullnode.${network}.aptoslabs.com --assume-yes`;
    
    const result = execSync(publishCmd, { 
      cwd: 'contract',
      encoding: 'utf8'
    });
    
    console.log('✅ Contract published successfully!');
    console.log(result);
    
    // Update .env file with module address
    const envPath = '.env';
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add module address
    const moduleAddressRegex = /^NEXT_PUBLIC_MODULE_ADDRESS=.*$/m;
    const newModuleAddress = `NEXT_PUBLIC_MODULE_ADDRESS=${accountAddress}`;
    
    if (envContent.match(moduleAddressRegex)) {
      envContent = envContent.replace(moduleAddressRegex, newModuleAddress);
    } else {
      envContent += `\n${newModuleAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`📝 Updated .env with module address: ${accountAddress}`);
    
    console.log('\n🎉 Deployment complete!');
    console.log('You can now test your backend APIs at: http://localhost:3000/test-backend');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deployContract();