import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as path from 'path';

interface HostingStackProps extends cdk.StackProps {
  frontendBucket: s3.Bucket;
  distribution: cloudfront.Distribution;
  apiEndpoint: string;
}

export class HostingStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: HostingStackProps) {
    super(scope, id, props);

    // Deploy Angular app to S3
    new s3deploy.BucketDeployment(this, 'DeployAngularApp', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../my-angular-app/dist/my-angular-app/browser'))],
      destinationBucket: props.frontendBucket,
      distribution: props.distribution,
      distributionPaths: ['/*'],
    });

    // Create config.json with environment variables for the Angular app
    new s3deploy.BucketDeployment(this, 'DeployConfig', {
      sources: [
        s3deploy.Source.jsonData('config.json', {
          apiEndpoint: props.apiEndpoint,
          region: this.region,
          userPoolId: cdk.Fn.importValue('UserPoolId'),
          userPoolWebClientId: cdk.Fn.importValue('UserPoolClientId'),
          oauthDomain: cdk.Fn.importValue('UserPoolDomainUrl')
        }),
      ],
      destinationBucket: props.frontendBucket,
      destinationKeyPrefix: 'assets/config',
    });

    // Output the CloudFront URL
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${props.distribution.distributionDomainName}`,
      description: 'The URL of the deployed website',
      exportName: 'WebsiteURL'
    });
  }
}