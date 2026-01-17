/**
 * Storage Service for LocalSwap
 *
 * Supports Cloudflare R2 (recommended) or AWS S3.
 * Both are S3-compatible, so we use the AWS SDK for both.
 *
 * To configure R2:
 * 1. Create an R2 bucket in Cloudflare dashboard
 * 2. Create an API token with R2 read/write permissions
 * 3. Set these environment variables:
 *    - R2_ACCOUNT_ID (your Cloudflare account ID)
 *    - R2_ACCESS_KEY_ID (from API token)
 *    - R2_SECRET_ACCESS_KEY (from API token)
 *    - R2_BUCKET_NAME (your bucket name)
 *    - R2_PUBLIC_URL (your public bucket URL or custom domain)
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Check which storage provider is configured
const isR2Configured = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
)

const isS3Configured = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET
)

const isStorageConfigured = isR2Configured || isS3Configured

// Create S3 client based on configuration
function createStorageClient(): S3Client | null {
  if (isR2Configured) {
    return new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  }

  if (isS3Configured) {
    return new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  }

  return null
}

const storageClient = createStorageClient()
const bucketName = isR2Configured
  ? process.env.R2_BUCKET_NAME!
  : process.env.AWS_S3_BUCKET!

// Get the public URL base for uploaded files
function getPublicUrlBase(): string {
  if (isR2Configured && process.env.R2_PUBLIC_URL) {
    return process.env.R2_PUBLIC_URL
  }
  if (isS3Configured) {
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`
  }
  // Development fallback
  return '/uploads'
}

// Generate a unique file key
export function generateFileKey(
  userId: string,
  type: 'listing' | 'avatar' | 'message',
  originalName: string
): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  return `${type}s/${userId}/${timestamp}-${random}.${ext}`
}

// Upload a file
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Development mode without storage - return mock URL
  if (!isStorageConfigured || !storageClient) {
    console.log(`[DEV STORAGE] Would upload: ${key}`)
    return {
      success: true,
      url: `/placeholder-image.jpg`, // Use placeholder in dev
    }
  }

  try {
    await storageClient.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
        // Make publicly readable
        ACL: isR2Configured ? undefined : 'public-read',
      })
    )

    const url = `${getPublicUrlBase()}/${key}`
    return { success: true, url }
  } catch (error) {
    console.error('Storage upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

// Delete a file
export async function deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
  if (!isStorageConfigured || !storageClient) {
    console.log(`[DEV STORAGE] Would delete: ${key}`)
    return { success: true }
  }

  try {
    await storageClient.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Storage delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}

// Generate a presigned URL for direct upload from client
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<{ success: boolean; uploadUrl?: string; publicUrl?: string; error?: string }> {
  if (!isStorageConfigured || !storageClient) {
    return {
      success: false,
      error: 'Storage not configured',
    }
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(storageClient, command, { expiresIn })
    const publicUrl = `${getPublicUrlBase()}/${key}`

    return { success: true, uploadUrl, publicUrl }
  } catch (error) {
    console.error('Presigned URL error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate upload URL',
    }
  }
}

// Validate image file
export function validateImageFile(
  file: { size: number; type: string; name: string },
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File must be JPEG, PNG, WebP, or HEIC' }
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File must be smaller than ${maxSizeMB}MB` }
  }

  return { valid: true }
}

// Check if storage is configured
export function isConfigured(): boolean {
  return isStorageConfigured
}
