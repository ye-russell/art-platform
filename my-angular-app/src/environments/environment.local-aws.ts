export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Default to local API server, will be replaced by get-aws-config script
  region: 'eu-central-1', // Default region, will be replaced by get-aws-config script
  cognito: {
    userPoolId: 'placeholder', // Will be replaced by get-aws-config script
    userPoolWebClientId: 'placeholder', // Will be replaced by get-aws-config script
    oauth: {
      domain: 'placeholder', // Will be replaced by get-aws-config script
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'http://localhost:4200/callback',
      redirectSignOut: 'http://localhost:4200/',
      responseType: 'code'
    }
  }
};