const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to get stack output value
function getStackOutput(stackName, outputKey) {
  try {
    const output = execSync(
      `aws cloudformation describe-stacks --stack-name ${stackName} --query "Stacks[0].Outputs[?OutputKey=='${outputKey}'].OutputValue" --output text`
    ).toString().trim();
    return output;
  } catch (error) {
    console.error(`Error getting output ${outputKey} from stack ${stackName}:`, error.message);
    return '';
  }
}

// Get values from CloudFormation stacks
const apiEndpoint = getStackOutput('ArtPlatformApi', 'ApiEndpoint');
const region = process.env.AWS_REGION || 'eu-central-1';
const userPoolId = getStackOutput('ArtPlatformAuth', 'UserPoolId');
const userPoolWebClientId = getStackOutput('ArtPlatformAuth', 'UserPoolClientId');
const oauthDomain = getStackOutput('ArtPlatformAuth', 'UserPoolDomain');

// Log the values for debugging
console.log('API Endpoint:', apiEndpoint);
console.log('Region:', region);
console.log('User Pool ID:', userPoolId);
console.log('User Pool Web Client ID:', userPoolWebClientId);
console.log('OAuth Domain:', oauthDomain);

// Create config object
const config = {
  apiEndpoint,
  region,
  userPoolId,
  userPoolWebClientId,
  oauthDomain
};

// Create config directory if it doesn't exist
const configDir = path.join(__dirname, 'my-angular-app', 'dist', 'my-angular-app', 'browser', 'assets', 'config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Write config file
const configPath = path.join(configDir, 'config.json');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('Config file generated successfully at:', configPath);
console.log('Config:', config);