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

// Create config object
const config = {
  apiEndpoint,
  region,
  userPoolId,
  userPoolWebClientId,
  oauthDomain
};

// Create environment file content
const envContent = `export const environment = {
  production: false,
  apiUrl: '${apiEndpoint}',
  region: '${region}',
  cognito: {
    userPoolId: '${userPoolId}',
    userPoolWebClientId: '${userPoolWebClientId}',
    oauth: {
      domain: '${oauthDomain}',
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'http://localhost:4200/callback',
      redirectSignOut: 'http://localhost:4200/',
      responseType: 'code'
    }
  }
};
`;

// Write environment file
const envPath = path.join(__dirname, 'my-angular-app', 'src', 'environments', 'environment.local-aws.ts');
fs.writeFileSync(envPath, envContent);

console.log('Local AWS environment file generated successfully at:', envPath);
console.log('Config:', config);