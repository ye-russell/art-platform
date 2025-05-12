# Art Platform

A full-stack web application for artists to showcase and sell their artwork, built with Angular and AWS services.

## Architecture

This application uses the following AWS services:

- **Amazon S3**: For hosting the Angular frontend and storing artwork images
- **Amazon CloudFront**: For content delivery and HTTPS
- **Amazon Cognito**: For user authentication and authorization
- **Amazon DynamoDB**: For storing artist and artwork data
- **AWS Lambda**: For serverless API backend
- **Amazon API Gateway**: For API management and security

## Prerequisites

Before deploying the application, make sure you have:

1. **AWS CLI** installed and configured with appropriate credentials
2. **Node.js** and **npm** installed
3. **AWS CDK** installed globally (`npm install -g aws-cdk`)

## Deployment

### Option 1: Automated Deployment (Recommended)

Run the deployment script:

```bash
# On Windows
deploy.bat

# On macOS/Linux
chmod +x deploy.sh
./deploy.sh
```

This script will:
1. Install dependencies for the Lambda function
2. Build the Angular application for production
3. Deploy all AWS infrastructure using CDK
4. Upload the Angular app to the S3 bucket
5. Invalidate the CloudFront cache

### Option 2: Manual Deployment

1. **Deploy the AWS infrastructure**:
   ```bash
   cd infrastructure
   npm install
   npm run build
   npm run bootstrap  # Only needed the first time in an AWS account/region
   npm run deploy
   ```

2. **Build and deploy the Angular app**:
   ```bash
   cd my-angular-app
   npm install
   npm run build:prod
   
   # Get the S3 bucket name from CloudFormation outputs
   BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name ArtPlatformStorage --query "Stacks[0].Outputs[?ExportName=='FrontendBucketName'].OutputValue" --output text)
   
   # Upload to S3
   aws s3 sync dist/my-angular-app/browser s3://$BUCKET_NAME --delete
   ```

3. **Invalidate CloudFront cache** (optional):
   ```bash
   # Get the CloudFront distribution ID
   DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items!=null] | [?contains(Aliases.Items, '$BUCKET_NAME')] | [0].Id" --output text)
   
   # Create invalidation
   aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
   ```

## Local Development

To run the application locally with AWS services:

1. **Get AWS configuration**:
   ```bash
   # On Windows
   get-aws-config.bat
   
   # On macOS/Linux
   chmod +x get-aws-config.sh
   ./get-aws-config.sh
   ```

2. **Start the Angular app**:
   ```bash
   cd my-angular-app
   npm run start:local-aws
   ```

## Project Structure

- **infrastructure/**: AWS CDK code for infrastructure deployment
  - **lib/**: Stack definitions for different AWS resources
  - **bin/**: Entry point for CDK app
  
- **my-angular-app/**: Angular frontend application
  - **src/**: Source code
  - **src/app/**: Angular components, services, etc.
  - **src/environments/**: Environment configuration files
  
- **server-lambda/**: Lambda function code for the API backend

## Testing

- **Angular app**: `cd my-angular-app && npm test`
- **Infrastructure**: `cd infrastructure && npm test`

## Cleanup

To remove all deployed resources:

```bash
cd infrastructure
npm run destroy
```

Note: This will delete all resources except those with a removal policy of RETAIN (like the DynamoDB tables and S3 asset bucket).