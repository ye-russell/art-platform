const { handler } = require('./server-lambda/index');
const { v4: uuidv4 } = require('uuid');

// Mock environment variables
process.env.ARTISTS_TABLE = 'MockArtistsTable';
process.env.ARTWORKS_TABLE = 'MockArtworksTable';
process.env.ASSETS_BUCKET = 'mock-assets-bucket';
process.env.USER_POOL_ID = 'mock-user-pool-id';

// Mock data storage
const mockItems = {
  artists: [],
  artworks: []
};

// Mock AWS SDK modules
jest.mock('@aws-sdk/client-dynamodb', () => ({}), { virtual: true });
jest.mock('@aws-sdk/client-s3', () => ({}), { virtual: true });
jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({}), { virtual: true });
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://mock-presigned-url.com')
}), { virtual: true });

// Mock DynamoDB Document Client
jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    DynamoDBDocumentClient: {
      from: jest.fn().mockReturnValue({
        send: jest.fn().mockImplementation(async (command) => {
          // Mock GetCommand
          if (command.constructor.name === 'GetCommand') {
            const tableName = command.input.TableName;
            const key = command.input.Key;
            
            if (tableName === process.env.ARTISTS_TABLE) {
              const artist = mockItems.artists.find(a => a.artistId === key.artistId);
              return { Item: artist };
            } else if (tableName === process.env.ARTWORKS_TABLE) {
              const artwork = mockItems.artworks.find(a => a.artworkId === key.artworkId);
              return { Item: artwork };
            }
          } 
          // Mock PutCommand
          else if (command.constructor.name === 'PutCommand') {
            const tableName = command.input.TableName;
            const item = command.input.Item;
            
            if (tableName === process.env.ARTISTS_TABLE) {
              mockItems.artists.push(item);
            } else if (tableName === process.env.ARTWORKS_TABLE) {
              mockItems.artworks.push(item);
            }
            return {};
          } 
          // Mock ScanCommand
          else if (command.constructor.name === 'ScanCommand') {
            const tableName = command.input.TableName;
            
            if (tableName === process.env.ARTISTS_TABLE) {
              return { Items: mockItems.artists };
            } else if (tableName === process.env.ARTWORKS_TABLE) {
              return { Items: mockItems.artworks };
            }
            return { Items: [] };
          }
          // Mock QueryCommand
          else if (command.constructor.name === 'QueryCommand') {
            return { Items: [] };
          }
          // Mock other commands
          return {};
        })
      })
    }
  };
});

// Test function
async function runTests() {
  console.log('Starting API tests...');
  
  // Test 1: Get all artists (empty)
  console.log('\nTest 1: Get all artists');
  const getAllArtistsEvent = {
    path: '/api/artists',
    httpMethod: 'GET',
    pathParameters: {},
    queryStringParameters: {}
  };
  
  const getAllArtistsResult = await handler(getAllArtistsEvent);
  console.log('Result:', getAllArtistsResult);
  
  // Test 2: Create an artist
  console.log('\nTest 2: Create an artist');
  const createArtistEvent = {
    path: '/api/artists',
    httpMethod: 'POST',
    pathParameters: {},
    queryStringParameters: {},
    body: JSON.stringify({
      name: 'Test Artist',
      bio: 'This is a test artist',
      email: 'test@example.com'
    }),
    requestContext: {
      authorizer: {
        claims: {
          sub: 'test-user-id',
          email: 'test@example.com'
        }
      }
    }
  };
  
  const createArtistResult = await handler(createArtistEvent);
  console.log('Result:', createArtistResult);
  const artistId = JSON.parse(createArtistResult.body).artistId;
  
  // Test 3: Get the created artist
  console.log('\nTest 3: Get the created artist');
  const getArtistEvent = {
    path: `/api/artists/${artistId}`,
    httpMethod: 'GET',
    pathParameters: { artistId },
    queryStringParameters: {}
  };
  
  const getArtistResult = await handler(getArtistEvent);
  console.log('Result:', getArtistResult);
  
  // Test 4: Create an artwork
  console.log('\nTest 4: Create an artwork');
  const createArtworkEvent = {
    path: '/api/artworks',
    httpMethod: 'POST',
    pathParameters: {},
    queryStringParameters: {},
    body: JSON.stringify({
      artistId,
      title: 'Test Artwork',
      description: 'This is a test artwork',
      imageUrl: 'https://example.com/image.jpg',
      price: 100
    }),
    requestContext: {
      authorizer: {
        claims: {
          sub: 'test-user-id',
          email: 'test@example.com'
        }
      }
    }
  };
  
  const createArtworkResult = await handler(createArtworkEvent);
  console.log('Result:', createArtworkResult);
  const artworkId = JSON.parse(createArtworkResult.body).artworkId;
  
  // Test 5: Get all artworks
  console.log('\nTest 5: Get all artworks');
  const getAllArtworksEvent = {
    path: '/api/artworks',
    httpMethod: 'GET',
    pathParameters: {},
    queryStringParameters: {}
  };
  
  const getAllArtworksResult = await handler(getAllArtworksEvent);
  console.log('Result:', getAllArtworksResult);
  
  console.log('\nAll tests completed!');
}

// Setup global Jest mock
global.jest = {
  fn: () => ({
    mockReturnValue: () => ({}),
    mockImplementation: (fn) => fn
  }),
  mock: () => {}
};

// Run the tests
runTests().catch(console.error);