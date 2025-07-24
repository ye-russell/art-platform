import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiEndpoint: string;
  region: string;
  userPoolId?: string;
  userPoolWebClientId?: string;
  identityPoolId?: string;
  oauthDomain?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig | null = null;
  private configPromise: Promise<AppConfig> | null = null;
  private http = inject(HttpClient);

  async loadConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    if (this.configPromise) {
      return this.configPromise;
    }

    if (environment.production) {
      this.configPromise = firstValueFrom(
        this.http.get<AppConfig>('/assets/config/config.json')
      ).then(config => {
        this.config = config;
        
        // Update environment with loaded config
        environment.apiUrl = config.apiEndpoint;
        environment.region = config.region;
        
        if (config.userPoolId) {
          environment.cognito.userPoolId = config.userPoolId;
        }
        
        if (config.userPoolWebClientId) {
          environment.cognito.userPoolWebClientId = config.userPoolWebClientId;
        }
        
        if (config.oauthDomain) {
          environment.cognito.oauth.domain = config.oauthDomain;
          environment.cognito.oauth.redirectSignIn = `https://${window.location.host}/callback`;
          environment.cognito.oauth.redirectSignOut = `https://${window.location.host}/`;
        }
        
        return this.config;
      }).catch((error) => {
        console.warn('Failed to load config.json, using environment fallback:', error);
        // Fallback to environment variables if config.json fails
        this.config = {
          apiEndpoint: environment.apiUrl,
          region: environment.region,
          userPoolId: environment.cognito.userPoolId,
          userPoolWebClientId: environment.cognito.userPoolWebClientId,
          oauthDomain: environment.cognito.oauth.domain
        };
        return this.config;
      });
      
      return this.configPromise;
    } else {
      // In development, try to load config from assets first, fallback to environment
      try {
        this.configPromise = firstValueFrom(
          this.http.get<AppConfig>('/assets/config/config.json')
        ).then(config => {
          this.config = config;
          
          // Update environment with loaded config (same as production)
          environment.apiUrl = config.apiEndpoint;
          environment.region = config.region;
          
          if (config.userPoolId) {
            environment.cognito.userPoolId = config.userPoolId;
          }
          
          if (config.userPoolWebClientId) {
            environment.cognito.userPoolWebClientId = config.userPoolWebClientId;
          }
          
          if (config.oauthDomain) {
            environment.cognito.oauth.domain = config.oauthDomain;
            environment.cognito.oauth.redirectSignIn = `http://localhost:4200/callback`;
            environment.cognito.oauth.redirectSignOut = `http://localhost:4200/`;
          }
          
          return this.config;
        }).catch(() => {
          // Fallback to environment variables if config file doesn't exist or is empty
          this.config = {
            apiEndpoint: environment.apiUrl,
            region: environment.region,
            userPoolId: environment.cognito.userPoolId,
            userPoolWebClientId: environment.cognito.userPoolWebClientId,
            oauthDomain: environment.cognito.oauth.domain
          };
          return this.config;
        });
        
        return this.configPromise;
      } catch (error) {
        // Fallback to environment variables
        this.config = {
          apiEndpoint: environment.apiUrl,
          region: environment.region,
          userPoolId: environment.cognito.userPoolId,
          userPoolWebClientId: environment.cognito.userPoolWebClientId,
          oauthDomain: environment.cognito.oauth.domain
        };
        return this.config;
      }
    }
  }

  getConfig(): AppConfig | null {
    return this.config;
  }
}