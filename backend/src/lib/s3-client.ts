import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

const isLocal = process.env.IS_LOCAL === 'true';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(isLocal && {
    endpoint: process.env.AWS_ENDPOINT || 'http://localhost:4566',
    forcePathStyle: true,
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  }),
});

const BUCKET = process.env.S3_BUCKET || 'day-timeline-storage';

export async function getObject<T>(key: string): Promise<T | null> {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
    const body = await response.Body?.transformToString();
    return body ? JSON.parse(body) : null;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.name === 'NoSuchKey' || error.name === 'NotFound')
    ) {
      return null;
    }
    throw error;
  }
}

export async function putObject<T>(key: string, data: T): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    })
  );
}
