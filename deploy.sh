#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment of Art Platform to AWS...${NC}"

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

# Step 1: Install dependencies for server-lambda
echo -e "${GREEN}Installing server-lambda dependencies...${NC}"
cd server-lambda
npm install
cd ..

# Step 2: Build Angular app
echo -e "${GREEN}Building Angular app for production...${NC}"
cd my-angular-app
npm install
npm run build:prod
cd ..

# Step 3: Install dependencies for Lambda resources
echo -e "${GREEN}Installing Lambda resources dependencies...${NC}"
cd infrastructure/resources
npm install
cd ../..

# Step 4: Deploy infrastructure with CDK
echo -e "${GREEN}Deploying AWS infrastructure with CDK...${NC}"
cd infrastructure
npm install
npm run build
npm run bootstrap
npm run deploy
cd ..

# Step 5: Check if all required AWS resources exist
echo -e "${GREEN}Checking AWS resources...${NC}"
node check-aws-resources.js

# Step 6: Get the frontend bucket name from CloudFormation outputs
echo -e "${GREEN}Getting frontend bucket name...${NC}"
FRONTEND_BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name ArtPlatformStorageNew --query "Stacks[0].Outputs[?ExportName=='FrontendBucketName'].OutputValue" --output text)

if [ -z "$FRONTEND_BUCKET_NAME" ]; then
    echo -e "${RED}Failed to get frontend bucket name. Please check if the stack was deployed correctly.${NC}"
    exit 1
fi

echo -e "${GREEN}Frontend bucket name: ${FRONTEND_BUCKET_NAME}${NC}"

# Step 7: Generate config file
echo -e "${GREEN}Generating config file...${NC}"
node generate-config.js

# Step 8: Deploy Angular app to S3
echo -e "${GREEN}Deploying Angular app to S3...${NC}"
aws s3 sync my-angular-app/dist/my-angular-app/browser s3://$FRONTEND_BUCKET_NAME --delete

# Step 9: Get the CloudFront distribution ID
echo -e "${GREEN}Getting CloudFront distribution ID...${NC}"
DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name ArtPlatformStorageNew --query "Stacks[0].Outputs[?ExportName=='CloudFrontDistributionId'].OutputValue" --output text)

if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "None" ]; then
    echo -e "${GREEN}Invalidating CloudFront cache for distribution: $DISTRIBUTION_ID...${NC}"
    aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
else
    echo -e "${YELLOW}CloudFront distribution ID not found. Skipping cache invalidation.${NC}"
fi

# Step 10: Get the website URL
WEBSITE_URL=$(aws cloudformation describe-stacks --stack-name ArtPlatformHosting --query "Stacks[0].Outputs[?ExportName=='WebsiteURL'].OutputValue" --output text)

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Your website is now available at: ${WEBSITE_URL}${NC}"