import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as path from 'path';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

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

    // Create a custom resource to generate and upload the config.json file
    const configGeneratorRole = new iam.Role(this, 'ConfigGeneratorRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ]
    });

    // Grant permissions to write to the S3 bucket
    props.frontendBucket.grantWrite(configGeneratorRole);

    // Create a custom resource that will generate the config file
    const configGenerator = new cr.AwsCustomResource(this, 'ConfigGenerator', {
      onUpdate: {
        service: 'S3',
        action: 'putObject',
        parameters: {
          Bucket: props.frontendBucket.bucketName,
          Key: 'assets/config/config.json',
          Body: cdk.Stack.of(this).toJsonString({
            apiEndpoint: props.apiEndpoint,
            region: this.region,
            userPoolId: cdk.Fn.importValue('UserPoolId'),
            userPoolWebClientId: cdk.Fn.importValue('UserPoolClientId'),
            oauthDomain: cdk.Fn.importValue('UserPoolDomainUrl')
          }),
          ContentType: 'application/json'
        },
        physicalResourceId: cr.PhysicalResourceId.of('config-' + Date.now().toString())
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [props.frontendBucket.arnForObjects('assets/config/config.json')]
      }),
      role: configGeneratorRole
    });

    // Invalidate CloudFront cache when config is updated
    if (props.distribution) {
      const invalidation = new cr.AwsCustomResource(this, 'ConfigInvalidation', {
        onUpdate: {
          service: 'CloudFront',
          action: 'createInvalidation',
          parameters: {
            DistributionId: props.distribution.distributionId,
            InvalidationBatch: {
              CallerReference: Date.now().toString(),
              Paths: {
                Quantity: 1,
                Items: ['/assets/config/config.json']
              }
            }
          },
          physicalResourceId: cr.PhysicalResourceId.of('invalidation-' + Date.now().toString())
        },
        policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
          resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE
        })
      });
      
      // Ensure invalidation happens after config is generated
      invalidation.node.addDependency(configGenerator);
    }

    // Output the CloudFront URL
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${props.distribution.distributionDomainName}`,
      description: 'The URL of the deployed website',
      exportName: 'WebsiteURL'
    });
  }
}