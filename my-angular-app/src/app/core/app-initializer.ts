import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ENVIRONMENT_INITIALIZER, inject } from '@angular/core';
import { ConfigService } from './config.service';

function initializeAppFactory() {
  const configService = inject(ConfigService);
  return () => configService.loadConfig();
}

export const appInitializer: EnvironmentProviders = makeEnvironmentProviders([
  {
    provide: ENVIRONMENT_INITIALIZER,
    useFactory: initializeAppFactory,
    multi: true
  }
]);