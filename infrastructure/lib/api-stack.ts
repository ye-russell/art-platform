import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import * as logs from 'aws-cdk-lib/aws-logs';

interface ApiStackProps extends cdk.StackProps {
  artistsTable: dynamodb.Table;
  artworksTable: dynamodb.Table;
  assetsBucket: s3.Bucket;
  userPool: cognito.UserPool;
}

export class ApiStack extends cdk.Stack {
  public readonly apiEndpoint: string;

  constructor(scope: cdk.App, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create Lambda function for API backend
    const apiLambda = new lambda.Function(this, 'ArtPlatformApiFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../server-lambda')),
      environment: {
        ARTISTS_TABLE: props.artistsTable.tableName,
        ARTWORKS_TABLE: props.artworksTable.tableName,
        ASSETS_BUCKET: props.assetsBucket.bucketName,
        USER_POOL_ID: props.userPool.userPoolId,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      logRetention: logs.RetentionDays.ONE_WEEK, // Add CloudWatch logs retention
    });

    // Grant permissions to Lambda to access DynamoDB tables
    props.artistsTable.grantReadWriteData(apiLambda);
    props.artworksTable.grantReadWriteData(apiLambda);
    
    // Grant permissions to Lambda to access S3 bucket
    props.assetsBucket.grantReadWrite(apiLambda);
    
    // Grant permissions to Lambda to access Cognito
    apiLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'cognito-idp:AdminGetUser',
        'cognito-idp:ListUsers',
      ],
      resources: [props.userPool.userPoolArn],
    }));

    // Create API Gateway with WAF and throttling
    const api = new apigateway.RestApi(this, 'ArtPlatformApi', {
      restApiName: 'Art Platform API',
      description: 'API for Art Platform',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key'],
        allowCredentials: true,
      },
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 10, // Requests per second
        throttlingBurstLimit: 20, // Concurrent requests
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        metricsEnabled: true,
      },
    });

    // Create Cognito authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'ArtPlatformAuthorizer', {
      cognitoUserPools: [props.userPool],
    });

    // Create API resources
    const apiResource = api.root.addResource('api');
    
    // Artists resource
    const artistsResource = apiResource.addResource('artists');
    artistsResource.addMethod('GET', new apigateway.LambdaIntegration(apiLambda));
    artistsResource.addMethod('POST', new apigateway.LambdaIntegration(apiLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    const singleArtistResource = artistsResource.addResource('{artistId}');
    singleArtistResource.addMethod('GET', new apigateway.LambdaIntegration(apiLambda));
    singleArtistResource.addMethod('PUT', new apigateway.LambdaIntegration(apiLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    singleArtistResource.addMethod('DELETE', new apigateway.LambdaIntegration(apiLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Artworks resource
    const artworksResource = apiResource.addResource('artworks');
    artworksResource.addMethod('GET', new apigateway.LambdaIntegration(apiLambda));
    artworksResource.addMethod('POST', new apigateway.LambdaIntegration(apiLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    const singleArtworkResource = artworksResource.addResource('{artworkId}');
    singleArtworkResource.addMethod('GET', new apigateway.LambdaIntegration(apiLambda));
    singleArtworkResource.addMethod('PUT', new apigateway.LambdaIntegration(apiLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    singleArtworkResource.addMethod('DELETE', new apigateway.LambdaIntegration(apiLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Create S3 presigned URL endpoint
    const uploadsResource = apiResource.addResource('uploads');
    uploadsResource.addMethod('POST', new apigateway.LambdaIntegration(apiLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    
    // User endpoint
    const userResource = apiResource.addResource('user');
    userResource.addMethod('GET', new apigateway.LambdaIntegration(apiLambda), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Output the API endpoint
    this.apiEndpoint = api.url;
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'The URL of the API Gateway',
      exportName: 'ApiEndpoint',
    });
  }
}