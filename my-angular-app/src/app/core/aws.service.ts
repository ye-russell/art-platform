import { Injectable } from '@angular/core';
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { environment } from '../../environments/environment';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AwsService {
  private initialized = false;

  constructor(private configService: ConfigService) {
    // Don't initialize immediately, wait for explicit call
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Wait for config to be loaded
    await this.configService.loadConfig();
    
    // Verify we have required Cognito configuration
    if (!environment.cognito.userPoolId || !environment.cognito.userPoolWebClientId) {
      throw new Error('Cognito configuration missing. UserPool ID and Client ID are required.');
    }

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

    this.initialized = true;
    console.log('Amplify configured with:', {
      userPoolId: environment.cognito.userPoolId,
      userPoolClientId: environment.cognito.userPoolWebClientId,
      domain: environment.cognito.oauth.domain
    });
  }

  private async initializeAmplify() {
    // Legacy method - keeping for backwards compatibility
    await this.initialize();
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}