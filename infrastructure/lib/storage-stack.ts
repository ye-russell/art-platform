import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';

export class StorageStack extends cdk.Stack {
  public readonly frontendBucket: s3.Bucket;
  public readonly assetsBucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Frontend hosting bucket - REMOVE website configuration
    this.frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      // Remove these lines:
      // websiteIndexDocument: 'index.html',
      // websiteErrorDocument: 'index.html',
      
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
    });

    // Create Origin Access Identity for CloudFront
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: 'Allow CloudFront to access both S3 buckets',
    });

    // Assets bucket for artwork images (ADD THIS - it was missing!)
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

    // Grant read access to CloudFront for both buckets
    this.frontendBucket.grantRead(originAccessIdentity);
    this.assetsBucket.grantRead(originAccessIdentity);

    // CloudFront distribution - BOTH origins should use S3Origin with OAI
    this.distribution = new cloudfront.Distribution(this, 'ArtPlatformCdn', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.frontendBucket, {
          originAccessIdentity, // Use OAI instead of website endpoint
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
      },
      additionalBehaviors: {
        '/assets/*': {
          origin: new origins.S3Origin(this.assetsBucket, {
            originAccessIdentity, // Same OAI for both
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        }
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        }
      ],
      defaultRootObject: 'index.html',
    });

    // Output the CloudFront URL
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'The domain name of the Distribution',
      exportName: 'ArtPlatformNew-CloudFrontDomainName', // Changed from 'CloudFrontDomainName'
    });
    
    // Output the CloudFront distribution ID
    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'The ID of the CloudFront distribution',
      exportName: 'ArtPlatformNew-CloudFrontDistributionId', // Changed from 'CloudFrontDistributionId'
    });

    // Output the frontend bucket name
    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: this.frontendBucket.bucketName,
      description: 'The name of the frontend S3 bucket',
      exportName: 'ArtPlatformNew-FrontendBucketName', // Changed from 'FrontendBucketName'
    });

    // Output the assets bucket name
    new cdk.CfnOutput(this, 'AssetsBucketName', {
      value: this.assetsBucket.bucketName,
      description: 'The name of the assets S3 bucket',
      exportName: 'ArtPlatformNew-AssetsBucketName', // Changed from 'AssetsBucketName'
    });
  }
}