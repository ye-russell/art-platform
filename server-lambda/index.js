const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const cognito = new AWS.CognitoIdentityServiceProvider();

// Environment variables from CDK
const ARTISTS_TABLE = process.env.ARTISTS_TABLE;
const ARTWORKS_TABLE = process.env.ARTWORKS_TABLE;
const ASSETS_BUCKET = process.env.ASSETS_BUCKET;
const USER_POOL_ID = process.env.USER_POOL_ID;

// Lambda handler
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract path and method from the event
    const path = event.path;
    const httpMethod = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const queryStringParameters = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};
    
    // Get user information from the request if available
    let userId = null;
    let userEmail = null;
    
    if (event.requestContext && event.requestContext.authorizer && event.requestContext.authorizer.claims) {
      userId = event.requestContext.authorizer.claims.sub;
      userEmail = event.requestContext.authorizer.claims.email;
      console.log(`Request from authenticated user: ${userId} (${userEmail})`);
    }
    
    // Route the request based on path and method
    if (path.startsWith('/api/artists')) {
      return await handleArtistsRoute(httpMethod, pathParameters, queryStringParameters, body, userId);
    } else if (path.startsWith('/api/artworks')) {
      return await handleArtworksRoute(httpMethod, pathParameters, queryStringParameters, body, userId);
    } else if (path.startsWith('/api/uploads')) {
      return await handleUploadsRoute(httpMethod, body, userId);
    } else if (path.startsWith('/api/user')) {
      return await handleUserRoute(httpMethod, userId, userEmail);
    } else {
      return buildResponse(404, { message: 'Not Found' });
    }
  } catch (error) {
    console.error('Error:', error);
    return buildResponse(500, { message: 'Internal Server Error', error: error.message });
  }
};

// Handle user routes
async function handleUserRoute(httpMethod, userId, userEmail) {
  if (httpMethod !== 'GET') {
    return buildResponse(405, { message: 'Method Not Allowed' });
  }
  
  if (!userId) {
    return buildResponse(401, { message: 'Unauthorized' });
  }
  
  try {
    // Get user from Cognito
    const params = {
      UserPoolId: USER_POOL_ID,
      Username: userId
    };
    
    const cognitoUser = await cognito.adminGetUser(params).promise();
    
    // Check if user is an artist
    const artistParams = {
      TableName: ARTISTS_TABLE,
      IndexName: 'UserIdIndex', // You'll need to create this GSI
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    
    let artistProfile = null;
    try {
      const artistResult = await dynamodb.query(artistParams).promise();
      if (artistResult.Items && artistResult.Items.length > 0) {
        artistProfile = artistResult.Items[0];
      }
    } catch (err) {
      console.log('User is not an artist yet:', err);
    }
    
    return buildResponse(200, {
      userId,
      email: userEmail,
      isArtist: !!artistProfile,
      artistProfile
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return buildResponse(500, { message: 'Error getting user information' });
  }
}

// Handle artists routes
async function handleArtistsRoute(httpMethod, pathParameters, queryStringParameters, body, userId) {
  const artistId = pathParameters.artistId;
  
  switch (httpMethod) {
    case 'GET':
      if (artistId) {
        // Get a specific artist
        const params = {
          TableName: ARTISTS_TABLE,
          Key: { artistId }
        };
        
        const result = await dynamodb.get(params).promise();
        if (!result.Item) {
          return buildResponse(404, { message: 'Artist not found' });
        }
        
        return buildResponse(200, result.Item);
      } else {
        // List all artists
        const params = {
          TableName: ARTISTS_TABLE
        };
        
        const result = await dynamodb.scan(params).promise();
        return buildResponse(200, result.Items);
      }
      
    case 'POST':
      // Create a new artist - requires authentication
      if (!userId) {
        return buildResponse(401, { message: 'Authentication required' });
      }
      
      const newArtist = {
        artistId: uuidv4(),
        userId: userId, // Link to Cognito user
        name: body.name,
        bio: body.bio,
        email: body.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await dynamodb.put({
        TableName: ARTISTS_TABLE,
        Item: newArtist
      }).promise();
      
      return buildResponse(201, newArtist);
      
    case 'PUT':
      if (!artistId) {
        return buildResponse(400, { message: 'Artist ID is required' });
      }
      
      // Verify ownership
      if (userId) {
        const artistRecord = await dynamodb.get({
          TableName: ARTISTS_TABLE,
          Key: { artistId }
        }).promise();
        
        if (!artistRecord.Item || artistRecord.Item.userId !== userId) {
          return buildResponse(403, { message: 'Not authorized to update this artist' });
        }
      } else {
        return buildResponse(401, { message: 'Authentication required' });
      }
      
      // Update an existing artist
      const updateParams = {
        TableName: ARTISTS_TABLE,
        Key: { artistId },
        UpdateExpression: 'set #name = :name, bio = :bio, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': body.name,
          ':bio': body.bio,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      };
      
      const updateResult = await dynamodb.update(updateParams).promise();
      return buildResponse(200, updateResult.Attributes);
      
    case 'DELETE':
      if (!artistId) {
        return buildResponse(400, { message: 'Artist ID is required' });
      }
      
      // Verify ownership
      if (userId) {
        const artistRecord = await dynamodb.get({
          TableName: ARTISTS_TABLE,
          Key: { artistId }
        }).promise();
        
        if (!artistRecord.Item || artistRecord.Item.userId !== userId) {
          return buildResponse(403, { message: 'Not authorized to delete this artist' });
        }
      } else {
        return buildResponse(401, { message: 'Authentication required' });
      }
      
      // Delete an artist
      await dynamodb.delete({
        TableName: ARTISTS_TABLE,
        Key: { artistId }
      }).promise();
      
      return buildResponse(204, {});
      
    default:
      return buildResponse(405, { message: 'Method Not Allowed' });
  }
}

// Handle artworks routes
async function handleArtworksRoute(httpMethod, pathParameters, queryStringParameters, body, userId) {
  const artworkId = pathParameters.artworkId;
  
  switch (httpMethod) {
    case 'GET':
      if (artworkId) {
        // Get a specific artwork
        const params = {
          TableName: ARTWORKS_TABLE,
          Key: { artworkId }
        };
        
        const result = await dynamodb.get(params).promise();
        if (!result.Item) {
          return buildResponse(404, { message: 'Artwork not found' });
        }
        
        return buildResponse(200, result.Item);
      } else {
        // List all artworks or filter by artist
        let params = {
          TableName: ARTWORKS_TABLE
        };
        
        if (queryStringParameters && queryStringParameters.artistId) {
          params = {
            TableName: ARTWORKS_TABLE,
            IndexName: 'ArtistArtworks',
            KeyConditionExpression: 'artistId = :artistId',
            ExpressionAttributeValues: {
              ':artistId': queryStringParameters.artistId
            }
          };
          
          const result = await dynamodb.query(params).promise();
          return buildResponse(200, result.Items);
        } else {
          const result = await dynamodb.scan(params).promise();
          return buildResponse(200, result.Items);
        }
      }
      
    case 'POST':
      // Create a new artwork - requires authentication
      if (!userId) {
        return buildResponse(401, { message: 'Authentication required' });
      }
      
      // Verify the user is the artist
      if (body.artistId) {
        const artistRecord = await dynamodb.get({
          TableName: ARTISTS_TABLE,
          Key: { artistId: body.artistId }
        }).promise();
        
        if (!artistRecord.Item || artistRecord.Item.userId !== userId) {
          return buildResponse(403, { message: 'Not authorized to create artwork for this artist' });
        }
      } else {
        return buildResponse(400, { message: 'Artist ID is required' });
      }
      
      const newArtwork = {
        artworkId: uuidv4(),
        artistId: body.artistId,
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        price: body.price,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await dynamodb.put({
        TableName: ARTWORKS_TABLE,
        Item: newArtwork
      }).promise();
      
      return buildResponse(201, newArtwork);
      
    case 'PUT':
      if (!artworkId) {
        return buildResponse(400, { message: 'Artwork ID is required' });
      }
      
      // Verify ownership
      if (userId) {
        const artworkRecord = await dynamodb.get({
          TableName: ARTWORKS_TABLE,
          Key: { artworkId }
        }).promise();
        
        if (!artworkRecord.Item) {
          return buildResponse(404, { message: 'Artwork not found' });
        }
        
        // Get the artist to verify ownership
        const artistRecord = await dynamodb.get({
          TableName: ARTISTS_TABLE,
          Key: { artistId: artworkRecord.Item.artistId }
        }).promise();
        
        if (!artistRecord.Item || artistRecord.Item.userId !== userId) {
          return buildResponse(403, { message: 'Not authorized to update this artwork' });
        }
      } else {
        return buildResponse(401, { message: 'Authentication required' });
      }
      
      // Update an existing artwork
      const updateParams = {
        TableName: ARTWORKS_TABLE,
        Key: { artworkId },
        UpdateExpression: 'set title = :title, description = :description, price = :price, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':title': body.title,
          ':description': body.description,
          ':price': body.price,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      };
      
      const updateResult = await dynamodb.update(updateParams).promise();
      return buildResponse(200, updateResult.Attributes);
      
    case 'DELETE':
      if (!artworkId) {
        return buildResponse(400, { message: 'Artwork ID is required' });
      }
      
      // Verify ownership
      if (userId) {
        const artworkRecord = await dynamodb.get({
          TableName: ARTWORKS_TABLE,
          Key: { artworkId }
        }).promise();
        
        if (!artworkRecord.Item) {
          return buildResponse(404, { message: 'Artwork not found' });
        }
        
        // Get the artist to verify ownership
        const artistRecord = await dynamodb.get({
          TableName: ARTISTS_TABLE,
          Key: { artistId: artworkRecord.Item.artistId }
        }).promise();
        
        if (!artistRecord.Item || artistRecord.Item.userId !== userId) {
          return buildResponse(403, { message: 'Not authorized to delete this artwork' });
        }
      } else {
        return buildResponse(401, { message: 'Authentication required' });
      }
      
      // Delete an artwork
      await dynamodb.delete({
        TableName: ARTWORKS_TABLE,
        Key: { artworkId }
      }).promise();
      
      return buildResponse(204, {});
      
    default:
      return buildResponse(405, { message: 'Method Not Allowed' });
  }
}

// Handle uploads route for S3 presigned URLs
async function handleUploadsRoute(httpMethod, body, userId) {
  if (httpMethod !== 'POST') {
    return buildResponse(405, { message: 'Method Not Allowed' });
  }
  
  // Require authentication
  if (!userId) {
    return buildResponse(401, { message: 'Authentication required' });
  }
  
  const fileType = body.fileType;
  const fileName = body.fileName;
  
  if (!fileType || !fileName) {
    return buildResponse(400, { message: 'fileType and fileName are required' });
  }
  
  // Use userId in the file path for better organization
  const fileKey = `uploads/${userId}/${uuidv4()}-${fileName}`;
  
  const params = {
    Bucket: ASSETS_BUCKET,
    Key: fileKey,
    ContentType: fileType,
    Expires: 300 // URL expires in 5 minutes
  };
  
  const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
  
  return buildResponse(200, {
    uploadUrl,
    fileKey,
    fileUrl: `https://${ASSETS_BUCKET}.s3.amazonaws.com/${fileKey}`
  });
}

// Helper function to build API response
function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key'
    },
    body: JSON.stringify(body)
  };
}