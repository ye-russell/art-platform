# Art Platform

A full-stack web application for artists to showcase and sell their artwork, built with Angular, Node.js Express, and AWS services.

## Architecture

This project uses the following AWS services:

- **Amazon Cognito**: User authentication and authorization
- **Amazon DynamoDB**: NoSQL database for storing artist and artwork data
- **Amazon S3**: Storage for static website hosting and artwork images
- **Amazon CloudFront**: Content delivery network for the frontend
- **AWS Lambda**: Serverless backend API
- **Amazon API Gateway**: API management and routing
- **AWS CDK**: Infrastructure as code

## Project Structure

- `/my-angular-app`: Angular frontend application
- `/server`: Local Express.js server for development
- `/server-lambda`: Lambda function for production API
- `/infrastructure`: AWS CDK code for deploying infrastructure

## Getting Started

### Prerequisites

- Node.js (v16+)
- AWS CLI configured with appropriate credentials
- AWS CDK installed globally (`npm install -g aws-cdk`)

### Local Development

1. Install dependencies for the Angular app:

```bash
cd my-angular-app
npm install
```

2. Install dependencies for the Express server:

```bash
cd server
npm install
```

3. Start the Express server:

```bash
cd server
npm start
```

4. Start the Angular app:

```bash
cd my-angular-app
ng serve
```

5. Open your browser and navigate to `http://localhost:4200`

### Deploying to AWS

1. Install dependencies for the CDK project:

```bash
cd infrastructure
npm install
```

2. Bootstrap your AWS environment (only needed once per AWS account/region):

```bash
cd infrastructure
npm run bootstrap
```

3. Deploy the infrastructure:

```bash
cd infrastructure
npm run deploy
```

4. After deployment, update the Angular environment with Cognito settings:

```bash
cd my-angular-app
chmod +x get-cognito-config.sh
./get-cognito-config.sh
```

5. Build and deploy the Angular app:

```bash
cd my-angular-app
ng build --configuration production
```

## Development Workflow

1. Make changes to the Angular app or Express server
2. Test locally
3. Update CDK code if infrastructure changes are needed
4. Deploy to AWS

## License

This project is licensed under the MIT License - see the LICENSE file for details.