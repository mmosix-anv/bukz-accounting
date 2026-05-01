import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env['AWS_REGION'] ?? 'eu-west-2',
  credentials: {
    accessKeyId: process.env['AWS_ACCESS_KEY_ID'] ?? '',
    secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
  },
});
const BUCKET = process.env['AWS_S3_BUCKET'] ?? '';

export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 300) {
  return getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }), { expiresIn });
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}

export function getPublicUrl(key: string) {
  const cdn = process.env['CLOUDFRONT_DOMAIN'];
  return cdn ? `https://${cdn}/${key}` : `https://${BUCKET}.s3.amazonaws.com/${key}`;
}
