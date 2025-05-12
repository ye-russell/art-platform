import { Injectable } from '@angular/core';
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { environment } from '../../environments/environment';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AwsService {
  constructor(private configService: ConfigService) {
    this.initializeAmplify();
  }

  private async initializeAmplify() {
    // Wait for config to be loaded
    await this.configService.loadConfig();
    
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: environment.cognito.userPoolId,
          userPoolClientId: environment.cognito.userPoolWebClientId,
          signUpVerificationMethod: 'code',
          loginWith: {
            email: true
          }
        }
      }
    });
  }
}