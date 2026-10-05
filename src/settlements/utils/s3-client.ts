import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export const uploadFileToS3 = async (
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'private, no-store',
    ServerSideEncryption: 'AES256',
  });

  await s3Client.send(command);
};
