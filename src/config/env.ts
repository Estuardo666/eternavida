import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
      (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
      "DATABASE_URL must be a valid PostgreSQL connection string",
    ),
  CLOUDFLARE_API_TOKEN: z.string().min(1).optional(),
  CLOUDFLARE_R2_ACCOUNT_ID: z.string().min(1).optional(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  CLOUDFLARE_R2_S3_API_URL: z.url("CLOUDFLARE_R2_S3_API_URL must be a valid URL").optional(),
  CLOUDFLARE_R2_BUCKET_URL: z.url("CLOUDFLARE_R2_BUCKET_URL must be a valid URL").optional(),
  CLOUDFLARE_R2_PUBLIC_DEV_URL: z
    .url("CLOUDFLARE_R2_PUBLIC_DEV_URL must be a valid URL")
    .optional(),
  EXTERNAL_PRODUCT_SYNC_ENDPOINT: z
    .url("EXTERNAL_PRODUCT_SYNC_ENDPOINT must be a valid URL")
    .optional(),
  EXTERNAL_PRODUCT_SYNC_BEARER_TOKEN: z.string().min(1).optional(),
  EXTERNAL_PRODUCT_SYNC_API_KEY: z.string().min(1).optional(),
  EXTERNAL_PRODUCT_SYNC_SOURCE_SYSTEM_ID: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM_NAME: z.string().min(1).optional(),
  EMAIL_FROM_ADDRESS: z.string().email().optional(),
  EMAIL_REPLY_TO: z.string().email().optional(),
});

const parsedServerEnv = serverEnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_R2_ACCOUNT_ID: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
  CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  CLOUDFLARE_R2_S3_API_URL: process.env.CLOUDFLARE_R2_S3_API_URL,
  CLOUDFLARE_R2_BUCKET_URL: process.env.CLOUDFLARE_R2_BUCKET_URL,
  CLOUDFLARE_R2_PUBLIC_DEV_URL: process.env.CLOUDFLARE_R2_PUBLIC_DEV_URL,
  EXTERNAL_PRODUCT_SYNC_ENDPOINT: process.env.EXTERNAL_PRODUCT_SYNC_ENDPOINT,
  EXTERNAL_PRODUCT_SYNC_BEARER_TOKEN: process.env.EXTERNAL_PRODUCT_SYNC_BEARER_TOKEN,
  EXTERNAL_PRODUCT_SYNC_API_KEY: process.env.EXTERNAL_PRODUCT_SYNC_API_KEY,
  EXTERNAL_PRODUCT_SYNC_SOURCE_SYSTEM_ID: process.env.EXTERNAL_PRODUCT_SYNC_SOURCE_SYSTEM_ID,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
  EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
  EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO,
});

if (!parsedServerEnv.success) {
  const formattedErrors = parsedServerEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid server environment variables: ${formattedErrors}`);
}

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const env: Readonly<ServerEnv> = Object.freeze(parsedServerEnv.data);
