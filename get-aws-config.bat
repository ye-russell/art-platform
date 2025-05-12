@echo off
echo Retrieving AWS configuration for local development...

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

REM Get stack outputs
echo Getting Cognito User Pool ID...
for /f "tokens=*" %%a in ('aws cloudformation describe-stacks --stack-name ArtPlatformAuth --query "Stacks[0].Outputs[?ExportName=='UserPoolId'].OutputValue" --output text') do set USER_POOL_ID=%%a

echo Getting Cognito User Pool Client ID...
for /f "tokens=*" %%a in ('aws cloudformation describe-stacks --stack-name ArtPlatformAuth --query "Stacks[0].Outputs[?ExportName=='UserPoolClientId'].OutputValue" --output text') do set USER_POOL_CLIENT_ID=%%a

echo Getting Cognito Domain...
for /f "tokens=*" %%a in ('aws cloudformation describe-stacks --stack-name ArtPlatformAuth --query "Stacks[0].Outputs[?ExportName=='UserPoolDomainUrl'].OutputValue" --output text') do set USER_POOL_DOMAIN=%%a

echo Getting API Endpoint...
for /f "tokens=*" %%a in ('aws cloudformation describe-stacks --stack-name ArtPlatformApi --query "Stacks[0].Outputs[?ExportName=='ApiEndpoint'].OutputValue" --output text') do set API_ENDPOINT=%%a

REM Get region from AWS config
for /f "tokens=*" %%a in ('aws configure get region') do set REGION=%%a

REM Create environment.local-aws.ts file
echo Creating environment.local-aws.ts file...
(
echo export const environment = {
echo   production: false,
echo   apiUrl: '%API_ENDPOINT%',
echo   region: '%REGION%',
echo   cognito: {
echo     userPoolId: '%USER_POOL_ID%',
echo     userPoolWebClientId: '%USER_POOL_CLIENT_ID%',
echo     oauth: {
echo       domain: '%USER_POOL_DOMAIN%',
echo       scope: ['email', 'openid', 'profile'],
echo       redirectSignIn: 'http://localhost:4200/callback',
echo       redirectSignOut: 'http://localhost:4200/',
echo       responseType: 'code'
echo     }
echo   }
echo };
) > my-angular-app\src\environments\environment.local-aws.ts

echo Configuration file created successfully!
echo You can now run 'npm run start:local-aws' to test your app with AWS services.