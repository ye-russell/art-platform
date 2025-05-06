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
    });

    this.artworksTable = new dynamodb.Table(this, 'Artworks', {
      partitionKey: { name: 'artworkId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'artistId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for querying artworks by artist
    this.artworksTable.addGlobalSecondaryIndex({
      indexName: 'ArtistArtworks',
      partitionKey: { name: 'artistId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });
  }
}
