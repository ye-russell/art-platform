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

# Step 3: Deploy infrastructure with CDK
echo -e "${GREEN}Deploying AWS infrastructure with CDK...${NC}"
cd infrastructure
npm install
npm run build
npm run bootstrap
npm run deploy
cd ..

# Step 4: Get the frontend bucket name from CloudFormation outputs
echo -e "${GREEN}Getting frontend bucket name...${NC}"
FRONTEND_BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name ArtPlatformStorage --query "Stacks[0].Outputs[?ExportName=='FrontendBucketName'].OutputValue" --output text)

if [ -z "$FRONTEND_BUCKET_NAME" ]; then
    echo -e "${RED}Failed to get frontend bucket name. Please check if the stack was deployed correctly.${NC}"
    exit 1
fi

echo -e "${GREEN}Frontend bucket name: ${FRONTEND_BUCKET_NAME}${NC}"

# Step 5: Update the deploy script in package.json with the actual bucket name
echo -e "${GREEN}Updating deploy script in package.json...${NC}"
sed -i "s/FRONTEND_BUCKET_NAME/$FRONTEND_BUCKET_NAME/g" my-angular-app/package.json

# Step 6: Deploy Angular app to S3 (this is handled by the HostingStack, but we'll do it again to be sure)
echo -e "${GREEN}Deploying Angular app to S3...${NC}"
cd my-angular-app
npm run deploy
cd ..

# Step 7: Invalidate CloudFront cache
echo -e "${GREEN}Getting CloudFront distribution ID...${NC}"
# Try to get distribution ID directly, or find it using the domain name
DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name ArtPlatformStorage --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)

# If not found, try to get it from the distribution domain name
if [ -z "$DISTRIBUTION_ID" ] || [ "$DISTRIBUTION_ID" == "None" ]; then
    DOMAIN_NAME=$(aws cloudformation describe-stacks --stack-name ArtPlatformStorage --query "Stacks[0].Outputs[?ExportName=='CloudFrontDomainName'].OutputValue" --output text)
    if [ -n "$DOMAIN_NAME" ]; then
        DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?DomainName=='$DOMAIN_NAME'].Id" --output text)
    fi
fi

if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "None" ]; then
    echo -e "${GREEN}Invalidating CloudFront cache for distribution: $DISTRIBUTION_ID...${NC}"
    aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
else
    echo -e "${YELLOW}CloudFront distribution ID not found. Skipping cache invalidation.${NC}"
fi

# Step 8: Get the website URL
WEBSITE_URL=$(aws cloudformation describe-stacks --stack-name ArtPlatformHosting --query "Stacks[0].Outputs[?ExportName=='WebsiteURL'].OutputValue" --output text)

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Your website is now available at: ${WEBSITE_URL}${NC}"