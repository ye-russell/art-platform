# Art Platform Deployment Guide

This guide provides detailed instructions for deploying the Art Platform application to AWS.

## Prerequisites

Before you begin, ensure you have:

1. **AWS Account**: An active AWS account with appropriate permissions
2. **AWS CLI**: Installed and configured with your credentials
   ```bash
   aws configure
   ```
3. **Node.js and npm**: Latest LTS version
4. **AWS CDK**: Installed globally
   ```bash
   npm install -g aws-cdk
   ```

## Step 1: Prepare Your Environment

1. Clone the repository (if you haven't already)
2. Navigate to the project root directory

## Step 2: Deploy Using the Automated Script

The easiest way to deploy is using the provided script:

### On Windows:
```bash
deploy.bat
```

### On macOS/Linux:
```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Install all necessary dependencies
- Build the Angular application
- Deploy the AWS infrastructure using CDK
- Upload the built Angular app to S3
- Invalidate the CloudFront cache

## Step 3: Verify Deployment

After deployment completes, you should see a URL for your deployed application. Open this URL in your browser to verify that the application is working correctly.

## Step 4: Create an Admin User (Optional)

To create an admin user in Cognito:

1. Go to the AWS Management Console
2. Navigate to Amazon Cognito > User Pools
3. Select your user pool (named "ArtPlatformUserPool")
4. Go to "Users and groups"
5. Click "Create user"
6. Fill in the required information
7. After creating the user, you can add them to an admin group if needed

## Troubleshooting

### Common Issues

1. **CDK Bootstrap Error**:
   If you see an error about CDK bootstrap, run:
   ```bash
   cd infrastructure
   npm run bootstrap
   ```

2. **Permission Issues**:
   Ensure your AWS user has the necessary permissions for creating all required resources.

3. **S3 Upload Failures**:
   If the Angular app fails to upload to S3, you can manually upload it:
   ```bash
   cd my-angular-app
   npm run build:prod
   aws s3 sync dist/my-angular-app/browser s3://YOUR_BUCKET_NAME --delete
   ```

4. **CloudFront Cache Issues**:
   If updates aren't showing, manually invalidate the cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

## Updating the Application

To update the application after making changes:

1. Make your changes to the code
2. Run the deployment script again
   ```bash
   # Windows
   deploy.bat
   
   # macOS/Linux
   ./deploy.sh
   ```

## Cleaning Up

To remove all deployed resources:

```bash
cd infrastructure
npm run destroy
```

Note: This will delete all resources except those with a removal policy of RETAIN (like the DynamoDB tables and S3 asset bucket).

## Monitoring and Logs

- **CloudWatch Logs**: Check Lambda function logs
- **CloudTrail**: Monitor API calls and resource changes
- **CloudWatch Metrics**: Monitor performance metrics

## Security Considerations

- The application uses Cognito for authentication
- API Gateway endpoints for modifying data require authentication
- S3 buckets are configured with appropriate access policies
- CloudFront uses HTTPS for secure content delivery