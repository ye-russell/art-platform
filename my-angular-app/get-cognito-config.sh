#!/bin/bash

# Get the values from AWS
USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 1 --query 'UserPools[0].Id' --output text)
CLIENT_ID=$(aws cognito-idp list-user-pool-clients --user-pool-id $USER_POOL_ID --query 'UserPoolClients[0].ClientId' --output text)
REGION=$(aws configure get region)

# Create environment.ts file
cat > src/environments/environment.ts << EOF
export const environment = {
  production: false,
  userPoolId: '${USER_POOL_ID}',
  userPoolClientId: '${CLIENT_ID}'
};
EOF

# Create environment.prod.ts file
cat > src/environments/environment.prod.ts << EOF
export const environment = {
  production: true,
  userPoolId: '${USER_POOL_ID}',
  userPoolClientId: '${CLIENT_ID}'
};
EOF

# Output the values
echo "Configuration has been updated with:"
echo "User Pool ID: ${USER_POOL_ID}"
echo "Client ID: ${CLIENT_ID}"
echo "Region: ${REGION}"
