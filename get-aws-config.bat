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

REM Get stack outputs with error checking - using correct export names
echo Getting Cognito User Pool ID...
for /f "tokens=*" %%a in ('aws cloudformation describe-stacks --stack-name ArtPlatformAuth --query "Stacks[0].Outputs[?ExportName=='ArtPlatformAuth-UserPoolId'].OutputValue" --output text 2^>nul') do set USER_POOL_ID=%%a
if "%USER_POOL_ID%"=="" (
    echo Error: Could not get User Pool ID. Check if ArtPlatformAuth stack exists.
    exit /b 1
)

echo Getting Cognito User Pool Client ID...
for /f "tokens=*" %%a in ('aws cloudformation describe-stacks --stack-name ArtPlatformAuth --query "Stacks[0].Outputs[?ExportName=='ArtPlatformAuth-UserPoolClientId'].OutputValue" --output text 2^>nul') do set USER_POOL_CLIENT_ID=%%a
if "%USER_POOL_CLIENT_ID%"=="" (
    echo Error: Could not get User Pool Client ID.
    exit /b 1
)

echo Getting Cognito Domain...
for /f "tokens=*" %%a in ('aws cloudformation describe-stacks --stack-name ArtPlatformAuth --query "Stacks[0].Outputs[?ExportName=='ArtPlatformAuth-UserPoolDomainUrl'].OutputValue" --output text 2^>nul') do set USER_POOL_DOMAIN=%%a
if "%USER_POOL_DOMAIN%"=="" (
    echo Error: Could not get User Pool Domain.
    exit /b 1
)

echo Getting API Endpoint...
for /f "tokens=*" %%a in ('aws cloudformation describe-stacks --stack-name ArtPlatformApi --query "Stacks[0].Outputs[?ExportName=='ApiEndpoint'].OutputValue" --output text 2^>nul') do set API_ENDPOINT=%%a
if "%API_ENDPOINT%"=="" (
    echo Error: Could not get API Endpoint. Check if ArtPlatformApi stack exists.
    exit /b 1
)

REM Get region from AWS config
for /f "tokens=*" %%a in ('aws configure get region 2^>nul') do set REGION=%%a
if "%REGION%"=="" set REGION=us-east-1

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

echo.
echo Configuration file created successfully!
echo Values retrieved:
echo - User Pool ID: %USER_POOL_ID%
echo - Client ID: %USER_POOL_CLIENT_ID%
echo - Domain: %USER_POOL_DOMAIN%
echo - API Endpoint: %API_ENDPOINT%
echo - Region: %REGION%
echo.
echo You can now run 'cd my-angular-app && npm run start:local-aws' to test your app with AWS services.