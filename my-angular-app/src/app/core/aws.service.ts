// src/app/core/aws.service.ts
import { Injectable } from '@angular/core';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { environment } from '../../environments/environment';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AwsService {
  private s3Client: S3Client;
  private dynamoDbClient: DynamoDBDocumentClient;

  constructor() {
    // Initialize S3 Client
    this.s3Client = new S3Client({
      region: environment.aws.region,
      credentials: {
        accessKeyId: environment.aws.accessKeyId,
        secretAccessKey: environment.aws.secretAccessKey
      }
    });

    // Initialize DynamoDB Client
    const ddbClient = new DynamoDBClient({
      region: environment.aws.region,
      credentials: {
        accessKeyId: environment.aws.accessKeyId,
        secretAccessKey: environment.aws.secretAccessKey
      }
    });

    this.dynamoDbClient = DynamoDBDocumentClient.from(ddbClient);
  }

  uploadToS3(file: File, key: string): Observable<string> {
    const params = {
      Bucket: environment.aws.s3Bucket,
      Key: `artwork/${key}`,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read'
    };

    return from(this.s3Client.send(new PutObjectCommand(params))
      .then(() => `https://${environment.aws.s3Bucket}.s3.${environment.aws.region}.amazonaws.com/artwork/${key}`));
  }

  saveMetadataToDynamoDB(metadata: ArtworkMetadata): Observable<any> {
    const params = {
      TableName: environment.aws.dynamoTable,
      Item: {
        id: metadata.id,
        title: metadata.title,
        description: metadata.description,
        artistInfo: metadata.artistInfo,
        imageUrl: metadata.imageUrl,
        createdAt: new Date().toISOString(),
        // Add any other metadata fields you need
      }
    };

    return from(this.dynamoDbClient.send(new PutCommand(params)));
  }
}

interface ArtworkMetadata {
  id: string;
  title: string;
  description: string;
  artistInfo: string;
  imageUrl: string;
}