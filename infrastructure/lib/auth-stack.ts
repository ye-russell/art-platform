import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly userPoolDomain: string;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, "ArtPlatformUserPool", {
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        email: { required: true },
        profilePicture: { required: false },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
    });

    // Create a unique domain prefix
    const domainPrefix = `art-platform-${this.account.substring(0, 8)}`;
    
    // Add domain to user pool
    const domain = this.userPool.addDomain("ArtPlatformDomain", {
      cognitoDomain: {
        domainPrefix: domainPrefix,
      },
    });
    
    this.userPoolDomain = domain.domainName;

    // Create user pool client with proper callback URLs
    this.userPoolClient = this.userPool.addClient("ArtPlatformClient", {
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
        callbackUrls: [
          "http://localhost:4200/callback",
          // We'll add the production URL after deployment
          "https://example.com/callback",
        ],
        logoutUrls: [
          "http://localhost:4200/",
          "https://example.com/",
        ],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO
      ],
    });

    // Export user pool ID
    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
      description: "The ID of the Cognito User Pool",
      exportName: "ArtPlatformAuth-UserPoolId"
    });

    // Export user pool client ID
    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
      description: "The ID of the Cognito User Pool Client",
      exportName: "ArtPlatformAuth-UserPoolClientId"
    });

    // Export user pool domain
    new cdk.CfnOutput(this, "UserPoolDomain", {
      value: domain.domainName,
      description: "The domain name of the Cognito User Pool",
      exportName: "ArtPlatformAuth-UserPoolDomain" // Changed from "UserPoolDomain"
    });
    
    // Export full domain URL
    new cdk.CfnOutput(this, "UserPoolDomainUrl", {
      value: `https://${domain.domainName}.auth.${this.region}.amazoncognito.com`,
      description: "The full URL of the Cognito User Pool domain",
      exportName: "ArtPlatformAuth-UserPoolDomainUrl"
    });
    
    // Export user pool ARN
    new cdk.CfnOutput(this, "UserPoolArn", {
      value: this.userPool.userPoolArn,
      description: "The ARN of the Cognito User Pool",
      exportName: "ArtPlatformAuth-UserPoolArn" // Changed from "UserPoolArn"
    });
  }
}