import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.AWS_REGION!;
const BUCKET = process.env.S3_BUCKET!;
const client = new S3Client({ region: REGION });

export async function uploadToS3(key: string, body: Buffer | string, contentType = 'application/octet-stream') {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'private',
  });
  await client.send(cmd);
  return key;
}

export async function getSignedUrlForKey(key: string, expiresIn = Number(process.env.SIGNED_URL_EXPIRE_SECONDS || 86400)) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(client, cmd, { expiresIn });
}
