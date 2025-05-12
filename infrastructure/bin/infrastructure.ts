#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StorageStack } from "../lib/storage-stack";
import { DatabaseStack } from "../lib/database-stack";
import { AuthStack } from "../lib/auth-stack";
import { ApiStack } from "../lib/api-stack";
import { HostingStack } from "../lib/hosting-stack";

const app = new cdk.App();

// Define environment
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || "eu-central-1",
};

// Create stacks
const storageStack = new StorageStack(app, "ArtPlatformStorage", { env });
const databaseStack = new DatabaseStack(app, "ArtPlatformDatabase", { env });
const authStack = new AuthStack(app, "ArtPlatformAuth", { env });

// Create API stack with references to other resources
const apiStack = new ApiStack(app, "ArtPlatformApi", {
  env,
  artistsTable: databaseStack.artistsTable,
  artworksTable: databaseStack.artworksTable,
  assetsBucket: storageStack.assetsBucket,
  userPool: authStack.userPool,
});

// Create hosting stack with references to storage and API
const hostingStack = new HostingStack(app, "ArtPlatformHosting", {
  env,
  frontendBucket: storageStack.frontendBucket,
  distribution: storageStack.distribution,
  apiEndpoint: apiStack.apiEndpoint,
});

// Add dependencies
apiStack.addDependency(storageStack);
apiStack.addDependency(databaseStack);
apiStack.addDependency(authStack);
hostingStack.addDependency(apiStack);
hostingStack.addDependency(storageStack);

// Add tags to all resources
cdk.Tags.of(app).add("Project", "ArtPlatform");
cdk.Tags.of(app).add("Environment", "Development");
