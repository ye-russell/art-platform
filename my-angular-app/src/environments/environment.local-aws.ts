export const environment = {
  production: false,
  apiUrl: 'https://euh6i3faoh.execute-api.eu-central-1.amazonaws.com/prod/',
  region: 'eu-central-1',
  cognito: {
    userPoolId: 'eu-central-1_bfM9xRYOp',
    userPoolWebClientId: '1odfqdviutgsbttid7keumacsu',
    oauth: {
      domain: 'https://art-platform-26673582.auth.eu-central-1.amazoncognito.com',
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'http://localhost:4200/callback',
      redirectSignOut: 'http://localhost:4200/',
      responseType: 'code'
    }
  }
};
