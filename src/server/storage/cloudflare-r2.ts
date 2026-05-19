import "server-only";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "@/config/env";

const CACHE_CONTROL_HEADER = "public, max-age=31536000, immutable";

export const MAX_MEDIA_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;

export class CloudflareR2ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudflareR2ConfigurationError";
  }
}

let r2Client: S3Client | null = null;

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function encodeStorageKey(storageKey: string): string {
  return storageKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function resolveBucketName(): string {
  if (!env.CLOUDFLARE_R2_BUCKET_URL) {
    throw new CloudflareR2ConfigurationError(
      "Cloudflare R2 upload is unavailable because CLOUDFLARE_R2_BUCKET_URL is missing.",
    );
  }

  const bucketName = new URL(env.CLOUDFLARE_R2_BUCKET_URL).pathname.replace(/^\/+|\/+$/g, "");
  if (!bucketName) {
    throw new CloudflareR2ConfigurationError(
      "Cloudflare R2 upload is unavailable because CLOUDFLARE_R2_BUCKET_URL does not include a bucket name.",
    );
  }

  return bucketName;
}

function assertUploadConfiguration(): void {
  if (!env.CLOUDFLARE_R2_S3_API_URL) {
    throw new CloudflareR2ConfigurationError(
      "Cloudflare R2 upload is unavailable because CLOUDFLARE_R2_S3_API_URL is missing.",
    );
  }

  if (!env.CLOUDFLARE_R2_ACCESS_KEY_ID || !env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
    throw new CloudflareR2ConfigurationError(
      "Cloudflare R2 upload is unavailable because CLOUDFLARE_R2_ACCESS_KEY_ID or CLOUDFLARE_R2_SECRET_ACCESS_KEY is missing.",
    );
  }

  resolveBucketName();
}

function getR2Client(): S3Client {
  assertUploadConfiguration();

  if (r2Client) {
    return r2Client;
  }

  const endpoint = env.CLOUDFLARE_R2_S3_API_URL;
  if (!endpoint) {
    throw new CloudflareR2ConfigurationError(
      "Cloudflare R2 upload is unavailable because CLOUDFLARE_R2_S3_API_URL is missing.",
    );
  }

  r2Client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });

  return r2Client;
}

export function buildR2PublicUrl(storageKey: string): string | null {
  if (!env.CLOUDFLARE_R2_PUBLIC_DEV_URL) {
    return null;
  }

  return `${trimTrailingSlash(env.CLOUDFLARE_R2_PUBLIC_DEV_URL)}/${encodeStorageKey(storageKey)}`;
}

export async function uploadObjectToCloudflareR2(input: {
  storageKey: string;
  body: Buffer;
  contentType: string;
  contentLength: number;
}): Promise<{ publicUrl: string | null }> {
  const client = getR2Client();
  const bucketName = resolveBucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: input.storageKey,
      Body: input.body,
      ContentType: input.contentType,
      ContentLength: input.contentLength,
      CacheControl: CACHE_CONTROL_HEADER,
    }),
  );

  return {
    publicUrl: buildR2PublicUrl(input.storageKey),
  };
}

export async function deleteObjectFromCloudflareR2(storageKey: string): Promise<void> {
  const client = getR2Client();
  const bucketName = resolveBucketName();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: storageKey,
    }),
  );
}