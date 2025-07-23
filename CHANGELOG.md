# Changelog

## Version 1.1.0 (Current)

### Infrastructure Updates
- Updated AWS CDK dependencies to the latest stable versions
- Added CloudFront distribution ID as an output for easier cache invalidation
- Improved security configurations for S3 buckets and CloudFront distribution

### Backend Updates
- Migrated Lambda function from AWS SDK v2 to AWS SDK v3
- Updated DynamoDB operations to use the new command pattern
- Improved error handling in Lambda functions
- Added proper testing setup with Jest

### Frontend Updates
- Added configuration generation for both production and local development
- Improved environment configuration handling
- Updated Angular dependencies

### Deployment Updates
- Enhanced deployment scripts for both Windows and Linux/macOS
- Added automatic config file generation during deployment
- Improved CloudFront cache invalidation
- Added better error handling in deployment scripts

### Development Workflow
- Added local API testing capabilities
- Created scripts for generating local development configurations
- Improved documentation for development workflow

### Documentation
- Updated README with latest best practices
- Added security best practices section
- Improved deployment instructions
- Added detailed development workflow documentation

## Version 1.0.0 (Initial Release)

- Initial project setup with Angular frontend and AWS backend
- Basic CRUD operations for artists and artworks
- User authentication with Amazon Cognito
- File uploads to S3
- CDK infrastructure for AWS resources