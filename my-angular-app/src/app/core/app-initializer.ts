import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ENVIRONMENT_INITIALIZER, inject } from '@angular/core';
import { ConfigService } from './config.service';
import { AwsService } from './aws.service';

function initializeAppFactory() {
  const configService = inject(ConfigService);
  const awsService = inject(AwsService);
  
  return async () => {
    try {
      // Load configuration first
      await configService.loadConfig();
      
      // Then initialize AWS services
      await awsService.initialize();
      
      console.log('App initialization completed successfully');
    } catch (error) {
      console.error('App initialization failed:', error);
      throw error;
    }
  };
}

export const appInitializer: EnvironmentProviders = makeEnvironmentProviders([
  {
    provide: ENVIRONMENT_INITIALIZER,
    useFactory: initializeAppFactory,
    multi: true
  }
]);