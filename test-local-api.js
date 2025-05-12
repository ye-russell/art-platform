const AWS = require('aws-sdk');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Get AWS configuration from environment variables or AWS CLI profile
const region = process.env.AWS_REGION || 'us-east-1';
AWS.config.update({ region });

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const cognito = new AWS.CognitoIdentityServiceProvider();

// Get table names from CloudFormation outputs
async function getTableNames() {
  const cloudformation = new AWS.CloudFormation();
  
  try {
    const artistsTable = await cloudformation.describeStacks({ StackName: 'ArtPlatformDatabase' }).promise()
      .then(data => data.Stacks[0].Outputs.find(output => output.ExportName === 'ArtistsTableName').OutputValue);
    
    const artworksTable = await cloudformation.describeStacks({ StackName: 'ArtPlatformDatabase' }).promise()
      .then(data => data.Stacks[0].Outputs.find(output => output.ExportName === 'ArtworksTableName').OutputValue);
    
    const assetsBucket = await cloudformation.describeStacks({ StackName: 'ArtPlatformStorage' }).promise()
      .then(data => data.Stacks[0].Outputs.find(output => output.ExportName === 'AssetsBucketName').OutputValue);
    
    const userPoolId = await cloudformation.describeStacks({ StackName: 'ArtPlatformAuth' }).promise()
      .then(data => data.Stacks[0].Outputs.find(output => output.ExportName === 'UserPoolId').OutputValue);
    
    return { artistsTable, artworksTable, assetsBucket, userPoolId };
  } catch (error) {
    console.error('Error getting table names:', error);
    throw error;
  }
}

// Start the server
async function startServer() {
  try {
    const { artistsTable, artworksTable, assetsBucket, userPoolId } = await getTableNames();
    console.log(`Using tables: Artists=${artistsTable}, Artworks=${artworksTable}, Assets=${assetsBucket}`);
    
    // Artists endpoints
    app.get('/api/artists', async (req, res) => {
      try {
        const params = {
          TableName: artistsTable
        };
        
        const result = await dynamodb.scan(params).promise();
        res.json(result.Items);
      } catch (error) {
        console.error('Error getting artists:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
    
    app.get('/api/artists/:artistId', async (req, res) => {
      try {
        const params = {
          TableName: artistsTable,
          Key: { artistId: req.params.artistId }
        };
        
        const result = await dynamodb.get(params).promise();
        if (!result.Item) {
          return res.status(404).json({ message: 'Artist not found' });
        }
        
        res.json(result.Item);
      } catch (error) {
        console.error('Error getting artist:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
    
    // Artworks endpoints
    app.get('/api/artworks', async (req, res) => {
      try {
        let params;
        
        if (req.query.artistId) {
          params = {
            TableName: artworksTable,
            IndexName: 'ArtistArtworks',
            KeyConditionExpression: 'artistId = :artistId',
            ExpressionAttributeValues: {
              ':artistId': req.query.artistId
            }
          };
          
          const result = await dynamodb.query(params).promise();
          res.json(result.Items);
        } else {
          params = {
            TableName: artworksTable
          };
          
          const result = await dynamodb.scan(params).promise();
          res.json(result.Items);
        }
      } catch (error) {
        console.error('Error getting artworks:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
    
    app.get('/api/artworks/:artworkId', async (req, res) => {
      try {
        const params = {
          TableName: artworksTable,
          Key: { artworkId: req.params.artworkId }
        };
        
        const result = await dynamodb.get(params).promise();
        if (!result.Item) {
          return res.status(404).json({ message: 'Artwork not found' });
        }
        
        res.json(result.Item);
      } catch (error) {
        console.error('Error getting artwork:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
    
    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Local API server running at http://localhost:${port}`);
      console.log('This server connects to your actual AWS resources for testing');
      console.log('Press Ctrl+C to stop');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();