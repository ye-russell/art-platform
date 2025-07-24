// Quick test to verify config.json is valid
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'src', 'assets', 'config', 'config.json');

try {
  const configContent = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configContent);
  
  console.log('✓ Config file is valid JSON');
  console.log('Configuration loaded:');
  console.log('- API Endpoint:', config.apiEndpoint);
  console.log('- Region:', config.region);
  console.log('- User Pool ID:', config.userPoolId);
  console.log('- Client ID:', config.userPoolWebClientId);
  console.log('- OAuth Domain:', config.oauthDomain);
  
  // Verify required fields
  const requiredFields = ['apiEndpoint', 'region', 'userPoolId', 'userPoolWebClientId'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    console.log('❌ Missing required fields:', missingFields.join(', '));
  } else {
    console.log('✓ All required Cognito configuration fields are present');
  }
  
} catch (error) {
  console.error('❌ Error reading or parsing config file:', error.message);
}
