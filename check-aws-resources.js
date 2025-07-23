const { execSync } = require('child_process');

// Function to check if a CloudFormation stack exists
function checkStackExists(stackName) {
  try {
    const result = execSync(
      `aws cloudformation describe-stacks --stack-name ${stackName} --query "Stacks[0].StackName" --output text`
    ).toString().trim();
    return result === stackName;
  } catch (error) {
    return false;
  }
}

// Function to check if a resource exists in a stack
function checkResourceExists(stackName, resourceType, resourceId) {
  try {
    const result = execSync(
      `aws cloudformation list-stack-resources --stack-name ${stackName} --query "StackResourceSummaries[?ResourceType=='${resourceType}' && LogicalId=='${resourceId}'].LogicalId" --output text`
    ).toString().trim();
    return result === resourceId;
  } catch (error) {
    return false;
  }
}

// Check if stacks exist
const stacks = [
  'ArtPlatformStorageNew',
  'ArtPlatformDatabase',
  'ArtPlatformAuth',
  'ArtPlatformApi',
  'ArtPlatformHosting'
];

console.log('Checking AWS resources...');

// Check stacks
let allStacksExist = true;
for (const stack of stacks) {
  const exists = checkStackExists(stack);
  console.log(`Stack ${stack}: ${exists ? 'EXISTS' : 'MISSING'}`);
  if (!exists) {
    allStacksExist = false;
  }
}

// If all stacks exist, check key resources
if (allStacksExist) {
  console.log('\nChecking key resources...');
  
  // Check S3 buckets
  const frontendBucketExists = checkResourceExists('ArtPlatformStorageNew', 'AWS::S3::Bucket', 'FrontendBucket');
  console.log(`Frontend S3 Bucket: ${frontendBucketExists ? 'EXISTS' : 'MISSING'}`);
  
  const assetsBucketExists = checkResourceExists('ArtPlatformStorageNew', 'AWS::S3::Bucket', 'AssetsBucket');
  console.log(`Assets S3 Bucket: ${assetsBucketExists ? 'EXISTS' : 'MISSING'}`);
  
  // Check CloudFront distribution
  const distributionExists = checkResourceExists('ArtPlatformStorageNew', 'AWS::CloudFront::Distribution', 'ArtPlatformCdn');
  console.log(`CloudFront Distribution: ${distributionExists ? 'EXISTS' : 'MISSING'}`);
  
  // Check DynamoDB tables
  const artistsTableExists = checkResourceExists('ArtPlatformDatabase', 'AWS::DynamoDB::Table', 'ArtistsTable');
  console.log(`Artists DynamoDB Table: ${artistsTableExists ? 'EXISTS' : 'MISSING'}`);
  
  const artworksTableExists = checkResourceExists('ArtPlatformDatabase', 'AWS::DynamoDB::Table', 'ArtworksTable');
  console.log(`Artworks DynamoDB Table: ${artworksTableExists ? 'EXISTS' : 'MISSING'}`);
  
  // Check Cognito user pool
  const userPoolExists = checkResourceExists('ArtPlatformAuth', 'AWS::Cognito::UserPool', 'UserPool');
  console.log(`Cognito User Pool: ${userPoolExists ? 'EXISTS' : 'MISSING'}`);
  
  // Check Lambda function
  const lambdaExists = checkResourceExists('ArtPlatformApi', 'AWS::Lambda::Function', 'ApiFunction');
  console.log(`Lambda Function: ${lambdaExists ? 'EXISTS' : 'MISSING'}`);
  
  // Check API Gateway
  const apiGatewayExists = checkResourceExists('ArtPlatformApi', 'AWS::ApiGateway::RestApi', 'ApiGateway');
  console.log(`API Gateway: ${apiGatewayExists ? 'EXISTS' : 'MISSING'}`);
  
  console.log('\nResource check completed.');
} else {
  console.log('\nSome stacks are missing. Please deploy the infrastructure first.');
}