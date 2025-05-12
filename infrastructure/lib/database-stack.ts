import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DatabaseStack extends cdk.Stack {
  public readonly artistsTable: dynamodb.Table;
  public readonly artworksTable: dynamodb.Table;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.artistsTable = new dynamodb.Table(this, 'Artists', {
      partitionKey: { name: 'artistId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true, // Enable point-in-time recovery for data protection
    });

    // Add GSI for querying artists by Cognito user ID
    this.artistsTable.addGlobalSecondaryIndex({
      indexName: 'UserIdIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    });

    this.artworksTable = new dynamodb.Table(this, 'Artworks', {
      partitionKey: { name: 'artworkId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true, // Enable point-in-time recovery for data protection
    });

    // Add GSI for querying artworks by artist
    this.artworksTable.addGlobalSecondaryIndex({
      indexName: 'ArtistArtworks',
      partitionKey: { name: 'artistId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });

    // Export table names
    new cdk.CfnOutput(this, 'ArtistsTableName', {
      value: this.artistsTable.tableName,
      description: 'The name of the artists table',
      exportName: 'ArtistsTableName',
    });

    new cdk.CfnOutput(this, 'ArtworksTableName', {
      value: this.artworksTable.tableName,
      description: 'The name of the artworks table',
      exportName: 'ArtworksTableName',
    });
  }
}