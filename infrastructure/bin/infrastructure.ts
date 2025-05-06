#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StorageStack } from '../lib/storage-stack';
import { DatabaseStack } from '../lib/database-stack';
import { AuthStack } from '../lib/auth-stack';

const app = new cdk.App();

// Define environment
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Create stacks
const storageStack = new StorageStack(app, 'ArtPlatformStorage', { env });
const databaseStack = new DatabaseStack(app, 'ArtPlatformDatabase', { env });
const authStack = new AuthStack(app, 'ArtPlatformAuth', { env });

// Add tags to all resources
cdk.Tags.of(app).add('Project', 'ArtPlatform');
cdk.Tags.of(app).add('Environment', 'Development');