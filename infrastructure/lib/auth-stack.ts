import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

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

    this.userPoolClient = this.userPool.addClient("ArtPlatformClient", {
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID],
        callbackUrls: [
          "http://localhost:4200/callback",
          "https://CLOUDFRONT_DOMAIN_PLACEHOLDER/callback",
        ],
        logoutUrls: [
          "http://localhost:4200/",
          "https://CLOUDFRONT_DOMAIN_PLACEHOLDER/",
        ],
      },
    });

    // Add these to the constructor in auth-stack.ts
    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
      description: "The ID of the Cognito User Pool",
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
      description: "The ID of the Cognito User Pool Client",
    });

    const domain = this.userPool.addDomain("ArtPlatformDomain", {
      cognitoDomain: {
        domainPrefix: "art-platform-" + this.account.substring(0, 8), // Make this unique
      },
    });

    // Output the domain
    new cdk.CfnOutput(this, "UserPoolDomain", {
      value: domain.domainName,
      description: "The domain name of the Cognito User Pool",
    });
  }
}
