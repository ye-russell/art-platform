@echo off
echo Starting deployment of Art Platform to AWS...

REM Check if AWS CLI is installed
where aws >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo AWS CLI is not installed. Please install it first.
    exit /b 1
)

REM Check if AWS credentials are configured
aws sts get-caller-identity >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo AWS credentials are not configured. Please run 'aws configure' first.
    exit /b 1
)

REM Step 1: Install dependencies for server-lambda
echo Installing server-lambda dependencies...
cd server-lambda
call npm install
cd ..

REM Step 2: Build Angular app
echo Building Angular app for production...
cd my-angular-app
call npm install
call npm run build:prod
cd ..

REM Step 3: Install dependencies for Lambda resources
echo Installing Lambda resources dependencies...
cd infrastructure\resources
call npm install
cd ..\..

REM Step 4: Deploy infrastructure with CDK
echo Deploying AWS infrastructure with CDK...
cd infrastructure
call npm install
call npm run build
call npm run bootstrap
call npm run deploy
cd ..

REM Step 5: Check if all required AWS resources exist
echo Checking AWS resources...
node check-aws-resources.js

REM Step 6: Get the frontend bucket name from CloudFormation outputs
echo Getting frontend bucket name...
for /f "tokens=*" %%a in ('aws cloudformation describe-stacks --stack-name ArtPlatformStorageNew --query "Stacks[0].Outputs[?ExportName=='FrontendBucketName'].OutputValue" --output text') do set FRONTEND_BUCKET_NAME=%%a

if "%FRONTEND_BUCKET_NAME%"=="" (
    echo Failed to get frontend bucket name. Please check if the stack was deployed correctly.
    exit /b 1
)

echo Frontend bucket name: %FRONTEND_BUCKET_NAME%

REM Step 7: Generate config file
echo Generating config file...
node generate-config.js

REM Step 8: Deploy Angular app to S3
echo Deploying Angular app to S3...
aws s3 sync my-angular-app\dist\my-angular-app\browser s3://%FRONTEND_BUCKET_NAME% --delete

REM Step 9: Get the CloudFront distribution ID
echo Getting CloudFront distribution ID...
for /f "tokens=*" %%a in ('aws cloudformation describe-stacks --stack-name ArtPlatformStorageNew --query "Stacks[0].Outputs[?ExportName=='CloudFrontDistributionId'].OutputValue" --output text') do set DISTRIBUTION_ID=%%a

if not "%DISTRIBUTION_ID%"=="" (
    echo Invalidating CloudFront cache for distribution: %DISTRIBUTION_ID%...
    aws cloudfront create-invalidation --distribution-id %DISTRIBUTION_ID% --paths "/*"
) else (
    echo CloudFront distribution ID not found. Skipping cache invalidation.
)

REM Step 10: Get the website URL
for /f "tokens=*" %%a in ('aws cloudformation describe-stacks --stack-name ArtPlatformHosting --query "Stacks[0].Outputs[?ExportName=='WebsiteURL'].OutputValue" --output text') do set WEBSITE_URL=%%a

echo Deployment completed successfully!
echo Your website is now available at: %WEBSITE_URL%