# Testing Your Angular App Locally with AWS Services

This guide will help you test your Angular application locally while connecting to your deployed AWS services.

## Prerequisites

1. AWS CLI installed and configured with your credentials
2. Node.js and npm installed
3. Your AWS infrastructure deployed using the CDK stacks

## Step 1: Get AWS Configuration

Run the script to retrieve your AWS configuration:

```bash
# Make the script executable
chmod +x get-aws-config.sh

# Run the script
./get-aws-config.sh
```

This will create an `environment.local-aws.ts` file with your actual AWS resource information.

## Step 2: Start the Local API Server (Optional)

If you want to test with a local API server that connects to your AWS resources:

```bash
# Install dependencies
npm install --prefix ./test-local-api-package.json

# Start the server
node test-local-api.js
```

This will start a local Express server on port 3000 that connects to your actual DynamoDB tables and S3 buckets.

## Step 3: Start the Angular App with AWS Configuration

```bash
cd my-angular-app
npm run start:local-aws
```

This will start your Angular app with the AWS configuration, connecting to either:
- Your deployed API Gateway endpoint, or
- Your local API server (if you updated the `apiUrl` in `environment.local-aws.ts` to point to `http://localhost:3000/api`)

## Step 4: Test Authentication

1. Open your browser to `http://localhost:4200`
2. Try to sign up and sign in using Cognito
3. Test creating artists and artworks

## Step 5: Test File Uploads

1. Sign in to your application
2. Try uploading an image
3. Verify that the image is uploaded to your S3 bucket

## Troubleshooting

### CORS Issues

If you encounter CORS issues:

1. Check that your API Gateway has the correct CORS configuration
2. If using the local API server, make sure it's running with the correct CORS headers

### Authentication Issues

If you have authentication issues:

1. Check that your Cognito User Pool and App Client are configured correctly
2. Verify that the callback URLs in your Cognito App Client include `http://localhost:4200/callback`

### API Connection Issues

If your app can't connect to the API:

1. Check that the `apiUrl` in your environment file is correct
2. Verify that your AWS credentials have the necessary permissions