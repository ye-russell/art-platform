#!/bin/bash

# This script retrieves Cognito configuration from CloudFormation outputs
# and updates the Angular environment files

# Get stack outputs
USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name ArtPlatformAuth --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text)
USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks --stack-name ArtPlatformAuth --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" --output text)
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name ArtPlatformApi --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)

# Update environment.ts
sed -i "s|userPoolId: ''|userPoolId: '$USER_POOL_ID'|g" src/environments/environment.ts
sed -i "s|userPoolWebClientId: ''|userPoolWebClientId: '$USER_POOL_CLIENT_ID'|g" src/environments/environment.ts
sed -i "s|apiUrl: 'http://localhost:5000/api'|apiUrl: '$API_ENDPOINT'|g" src/environments/environment.ts

echo "Updated environment.ts with Cognito configuration"
echo "UserPoolId: $USER_POOL_ID"
echo "UserPoolClientId: $USER_POOL_CLIENT_ID"
echo "API Endpoint: $API_ENDPOINT"