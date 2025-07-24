#!/usr/bin/env node

const { execSync } = require('child_process');

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return result.trim();
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function deploy() {
  try {
    console.log('🚀 Starting deployment...\n');
    
    // 1. Build the application
    console.log('📦 Building production application...');
    execSync('npm run build:prod', { stdio: 'inherit' });
    
    // 2. Get stack outputs
    console.log('\n📡 Getting AWS infrastructure details...');
    const stackOutputs = runCommand(
      'aws cloudformation describe-stacks --stack-name ArtPlatformStorageNew --query "Stacks[0].Outputs" --output json',
      'Fetching CloudFormation outputs'
    );
    
    const outputs = JSON.parse(stackOutputs);
    console.log('Available outputs:', outputs.map(o => o.OutputKey).join(', '));
    
    // 3. Find frontend bucket
    const frontendBucketOutput = outputs.find(output => 
      output.OutputKey.toLowerCase().includes('frontend') || 
      output.OutputKey.toLowerCase().includes('bucket')
    );
    
    if (!frontendBucketOutput) {
      console.log('Available buckets from CloudFormation:');
      outputs.forEach(output => {
        if (output.OutputKey.includes('Bucket')) {
          console.log(`  - ${output.OutputKey}: ${output.OutputValue}`);
        }
      });
      throw new Error('Frontend bucket not found in CloudFormation outputs');
    }
    
    const bucketName = frontendBucketOutput.OutputValue;
    console.log(`📦 Target bucket: ${bucketName}`);
    
    // 4. Deploy to S3
    console.log('\n📤 Uploading files to S3...');
    execSync(
      `aws s3 sync dist/my-angular-app/browser s3://${bucketName} --delete`,
      { stdio: 'inherit' }
    );
    
    // 5. Invalidate CloudFront
    const distributionOutput = outputs.find(output => 
      output.OutputKey.toLowerCase().includes('distribution') ||
      output.OutputKey.toLowerCase().includes('cloudfront')
    );
    
    if (distributionOutput) {
      console.log('\n♻️  Invalidating CloudFront cache...');
      const distributionId = distributionOutput.OutputValue.split('.')[0]; // Extract ID from domain
      execSync(
        `aws cloudfront create-invalidation --distribution-id ${distributionId} --paths "/*"`,
        { stdio: 'inherit' }
      );
    } else {
      console.log('\nℹ️  No CloudFront distribution found, skipping cache invalidation');
    }
    
    // 6. Get website URL
    const websiteUrl = distributionOutput 
      ? `https://${distributionOutput.OutputValue}`
      : `https://${bucketName}.s3-website-region.amazonaws.com`;
    
    console.log('\n✅ Deployment completed successfully!');
    console.log(`🌐 Your app should be available at: ${websiteUrl}`);
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
