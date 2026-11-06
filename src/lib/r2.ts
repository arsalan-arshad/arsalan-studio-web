import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME,
  );
}

function requireR2Env() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("R2 is not configured");
  }
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) return client;
  const { accountId, accessKeyId, secretAccessKey } = requireR2Env();
  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 180) || "file";
}

/** Object keys we store in Message.attachmentUrl (private R2 paths). */
export function isR2ObjectKey(value: string | null | undefined): boolean {
  return Boolean(value && value.startsWith("attachments/"));
}

export function assertAllowedUpload(file: {
  size: number;
  type: string;
  name: string;
}) {
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("File must be between 1 byte and 10 MB");
  }
  const type = file.type || "application/octet-stream";
  if (!ALLOWED_MIME.has(type)) {
    throw new Error("File type not allowed");
  }
  return { type, name: sanitizeFilename(file.name) };
}

export async function uploadToR2(input: {
  userId: string;
  file: Buffer;
  contentType: string;
  filename: string;
}): Promise<{ key: string; size: number; contentType: string; name: string }> {
  const { bucket } = requireR2Env();
  const name = sanitizeFilename(input.filename);
  const key = `attachments/${input.userId}/${randomUUID()}-${name}`;
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: input.file,
      ContentType: input.contentType,
      ContentDisposition: `attachment; filename="${name}"`,
    }),
  );
  return {
    key,
    size: input.file.byteLength,
    contentType: input.contentType,
    name,
  };
}

/** Short-lived HTTPS URL for authenticated clients (bucket stays private). */
export async function signedDownloadUrl(
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const { bucket } = requireR2Env();
  if (!isR2ObjectKey(key)) {
    throw new Error("Invalid object key");
  }
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: expiresInSeconds },
  );
}

export async function deleteFromR2(key: string): Promise<void> {
  if (!isR2Configured() || !isR2ObjectKey(key)) return;
  const { bucket } = requireR2Env();
  await getClient().send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key }),
  );
}

export async function withSignedAttachments<
  T extends {
    attachmentUrl?: string | null;
    attachmentName?: string | null;
  },
>(messages: T[]): Promise<T[]> {
  if (!isR2Configured()) return messages;
  return Promise.all(
    messages.map(async (m) => {
      if (!m.attachmentUrl || !isR2ObjectKey(m.attachmentUrl)) return m;
      try {
        const url = await signedDownloadUrl(m.attachmentUrl);
        return { ...m, attachmentUrl: url };
      } catch {
        return m;
      }
    }),
  );
}

export const R2_MAX_BYTES = MAX_BYTES;
