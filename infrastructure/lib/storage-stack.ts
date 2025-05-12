import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

export class StorageStack extends cdk.Stack {
  public readonly frontendBucket: s3.Bucket;
  public readonly assetsBucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Frontend hosting bucket
    this.frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true, // Optional: automatically delete objects when bucket is destroyed
      cors: [{
        allowedMethods: [s3.HttpMethods.GET],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
    });

    // Assets bucket for artwork images (private by default)
    this.assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [{
        allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
      // Keep this bucket private
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'ArtPlatformCdn', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      // Add additional behavior for assets bucket
      additionalBehaviors: {
        '/assets/*': {
          origin: new origins.S3Origin(this.assetsBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        }
      }
    });

    // Output the CloudFront URL
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'The domain name of the Distribution',
    });

    // Output the frontend bucket name
    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: this.frontendBucket.bucketName,
      description: 'The name of the frontend S3 bucket',
    });

    // Output the assets bucket name
    new cdk.CfnOutput(this, 'AssetsBucketName', {
      value: this.assetsBucket.bucketName,
      description: 'The name of the assets S3 bucket',
    });
  }
}
