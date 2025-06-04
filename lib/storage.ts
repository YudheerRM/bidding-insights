import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from './config';

// Validate credentials before creating S3 client
function validateCredentials() {
  const { spacesEndpoint, spacesAccessKey, spacesSecretKey, spacesBucket } = config.env.digitalOcean;
  
  if (!spacesEndpoint) {
    throw new Error('DO_SPACES_ENDPOINT environment variable is not set');
  }
  if (!spacesAccessKey) {
    throw new Error('DO_SPACES_ACCESS_KEY environment variable is not set');
  }
  if (!spacesSecretKey) {
    throw new Error('DO_SPACES_SECRET_KEY environment variable is not set');
  }
  if (!spacesBucket) {
    throw new Error('DO_SPACES_BUCKET environment variable is not set');
  }
}

// Validate credentials on module load
validateCredentials();

// Initialize S3 client for Digital Ocean Spaces
const s3Client = new S3Client({
  endpoint: config.env.digitalOcean.spacesEndpoint,
  region: 'us-east-1', // Digital Ocean Spaces uses this region by default
  credentials: {
    accessKeyId: config.env.digitalOcean.spacesAccessKey,
    secretAccessKey: config.env.digitalOcean.spacesSecretKey,
  },
  forcePathStyle: false, // Configures to use subdomain/virtual calling format
});

export interface UploadResult {
  s3Key: string;
  cdnUrl: string;
}

/**
 * Uploads a file to Digital Ocean Spaces
 * @param file The file to upload
 * @param folder The folder path in the bucket (e.g., 'tender-documents', 'tender-reports')
 * @param fileName Optional custom filename, otherwise uses original filename
 * @returns Promise with S3 key and CDN URL
 */
export async function uploadFile(
  file: File,
  folder: string,
  fileName?: string
): Promise<UploadResult> {
  // Generate unique filename if not provided
  const timestamp = Date.now();
  const sanitizedFileName = fileName || file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const s3Key = `${folder}/${timestamp}-${sanitizedFileName}`;

  try {
    const command = new PutObjectCommand({
      Bucket: config.env.digitalOcean.spacesBucket,
      Key: s3Key,
      Body: new Uint8Array(await file.arrayBuffer()),
      ContentType: file.type,
      ACL: 'public-read', // Make file publicly readable
    });

    await s3Client.send(command);

    // Generate CDN URL
    const cdnUrl = `${config.env.digitalOcean.spacesCdnUrl}/${s3Key}`;

    return {
      s3Key,
      cdnUrl,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deletes a file from Digital Ocean Spaces
 * @param s3Key The S3 key of the file to delete
 */
export async function deleteFile(s3Key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: config.env.digitalOcean.spacesBucket,
      Key: s3Key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a presigned URL for file upload (useful for client-side uploads)
 * @param s3Key The S3 key for the file
 * @param expiresIn Expiration time in seconds (default: 3600 = 1 hour)
 */
export async function getPresignedUploadUrl(
  s3Key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: config.env.digitalOcean.spacesBucket,
      Key: s3Key,
      ContentType: contentType,
      ACL: 'public-read',
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates file type and size
 * @param file The file to validate
 * @param allowedTypes Array of allowed MIME types
 * @param maxSizeInMB Maximum file size in MB
 */
export function validateFile(
  file: File,
  allowedTypes: string[] = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxSizeInMB: number = 10
): { isValid: boolean; error?: string } {
  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeInMB}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { isValid: true };
}
