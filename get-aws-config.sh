#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Retrieving AWS configuration for local development...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}AWS credentials are not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}jq is not installed. Please install it first.${NC}"
    exit 1
fi

# Get stack outputs
echo -e "${GREEN}Getting Cognito User Pool ID...${NC}"
USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name ArtPlatformAuth --query "Stacks[0].Outputs[?ExportName=='UserPoolId'].OutputValue" --output text)

echo -e "${GREEN}Getting Cognito User Pool Client ID...${NC}"
USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks --stack-name ArtPlatformAuth --query "Stacks[0].Outputs[?ExportName=='UserPoolClientId'].OutputValue" --output text)

echo -e "${GREEN}Getting Cognito Domain...${NC}"
USER_POOL_DOMAIN=$(aws cloudformation describe-stacks --stack-name ArtPlatformAuth --query "Stacks[0].Outputs[?ExportName=='UserPoolDomainUrl'].OutputValue" --output text)

echo -e "${GREEN}Getting API Endpoint...${NC}"
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name ArtPlatformApi --query "Stacks[0].Outputs[?ExportName=='ApiEndpoint'].OutputValue" --output text)

# Get region from AWS config
REGION=$(aws configure get region)

# Create environment.local-aws.ts file
echo -e "${GREEN}Creating environment.local-aws.ts file...${NC}"
cat > my-angular-app/src/environments/environment.local-aws.ts << EOF
export const environment = {
  production: false,
  apiUrl: '${API_ENDPOINT}',
  region: '${REGION}',
  cognito: {
    userPoolId: '${USER_POOL_ID}',
    userPoolWebClientId: '${USER_POOL_CLIENT_ID}',
    oauth: {
      domain: '${USER_POOL_DOMAIN}',
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'http://localhost:4200/callback',
      redirectSignOut: 'http://localhost:4200/',
      responseType: 'code'
    }
  }
};
EOF

echo -e "${GREEN}Configuration file created successfully!${NC}"
echo -e "${YELLOW}You can now run 'npm run start:local-aws' to test your app with AWS services.${NC}"