import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

/** AES-256-GCM body encryption version stored on Message.bodyVersion. */
export const CHAT_BODY_VERSION_PLAIN = 0;
export const CHAT_BODY_VERSION_AES_GCM = 1;

const IV_BYTES = 12;
const TAG_BYTES = 16;

function encryptionKey(): Buffer | null {
  const secret = process.env.CHAT_ENCRYPTION_SECRET?.trim();
  if (!secret) return null;
  // Deterministic 32-byte key from the env secret (not for password hashing).
  return createHash("sha256").update(secret, "utf8").digest();
}

export function isChatEncryptionConfigured(): boolean {
  return Boolean(process.env.CHAT_ENCRYPTION_SECRET?.trim());
}

export type EncryptedBody = {
  ciphertext: string;
  nonce: string;
  version: typeof CHAT_BODY_VERSION_AES_GCM;
};

/**
 * Encrypt a message body for at-rest storage.
 * Returns null when CHAT_ENCRYPTION_SECRET is unset (plaintext fallback for local/dev).
 */
export function encryptMessageBody(plaintext: string): EncryptedBody | null {
  const key = encryptionKey();
  if (!key) return null;

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([encrypted, tag]);

  return {
    ciphertext: payload.toString("base64"),
    nonce: iv.toString("base64"),
    version: CHAT_BODY_VERSION_AES_GCM,
  };
}

/**
 * Decrypt a stored body. Plaintext (version 0 / missing nonce) is returned as-is.
 * Throws if version 1 ciphertext cannot be decrypted (missing/wrong secret).
 */
export function decryptMessageBody(input: {
  body: string;
  bodyNonce?: string | null;
  bodyVersion?: number | null;
}): string {
  const version = input.bodyVersion ?? CHAT_BODY_VERSION_PLAIN;
  if (version === CHAT_BODY_VERSION_PLAIN || !input.bodyNonce) {
    return input.body;
  }

  if (version !== CHAT_BODY_VERSION_AES_GCM) {
    throw new Error(`Unsupported chat bodyVersion: ${version}`);
  }

  const key = encryptionKey();
  if (!key) {
    throw new Error("CHAT_ENCRYPTION_SECRET is required to decrypt messages");
  }

  const iv = Buffer.from(input.bodyNonce, "base64");
  const payload = Buffer.from(input.body, "base64");
  if (payload.length < TAG_BYTES) {
    throw new Error("Invalid ciphertext");
  }
  const encrypted = payload.subarray(0, payload.length - TAG_BYTES);
  const tag = payload.subarray(payload.length - TAG_BYTES);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}

/** Encrypt filename for optional at-rest protection (same AES-GCM scheme). */
export function encryptAttachmentName(
  name: string | null | undefined,
): EncryptedBody | null {
  if (!name) return null;
  return encryptMessageBody(name);
}

export function decryptAttachmentName(input: {
  attachmentName?: string | null;
  attachmentNameNonce?: string | null;
  attachmentNameVersion?: number | null;
}): string | null {
  if (!input.attachmentName) return null;
  if (
    !input.attachmentNameNonce ||
    (input.attachmentNameVersion ?? 0) === CHAT_BODY_VERSION_PLAIN
  ) {
    return input.attachmentName;
  }
  return decryptMessageBody({
    body: input.attachmentName,
    bodyNonce: input.attachmentNameNonce,
    bodyVersion: input.attachmentNameVersion,
  });
}

/**
 * Prepare Prisma create/update fields for a message body.
 * When encryption is configured, stores ciphertext + nonce + version 1.
 */
export function sealedMessageFields(plaintext: string): {
  body: string;
  bodyNonce: string | null;
  bodyVersion: number;
} {
  const sealed = encryptMessageBody(plaintext);
  if (!sealed) {
    return {
      body: plaintext,
      bodyNonce: null,
      bodyVersion: CHAT_BODY_VERSION_PLAIN,
    };
  }
  return {
    body: sealed.ciphertext,
    bodyNonce: sealed.nonce,
    bodyVersion: sealed.version,
  };
}

export function sealedAttachmentNameFields(
  name: string | null | undefined,
): {
  attachmentName: string | null;
  attachmentNameNonce: string | null;
  attachmentNameVersion: number;
} {
  if (!name) {
    return {
      attachmentName: null,
      attachmentNameNonce: null,
      attachmentNameVersion: CHAT_BODY_VERSION_PLAIN,
    };
  }
  const sealed = encryptAttachmentName(name);
  if (!sealed) {
    return {
      attachmentName: name,
      attachmentNameNonce: null,
      attachmentNameVersion: CHAT_BODY_VERSION_PLAIN,
    };
  }
  return {
    attachmentName: sealed.ciphertext,
    attachmentNameNonce: sealed.nonce,
    attachmentNameVersion: sealed.version,
  };
}

/** Decrypt for API responses; never throw to clients — log and redact on failure. */
export function safeDecryptBody(input: {
  body: string;
  bodyNonce?: string | null;
  bodyVersion?: number | null;
}): string {
  try {
    return decryptMessageBody(input);
  } catch (err) {
    console.error("[chat-crypto] decrypt failed", err);
    return "[Unable to decrypt message]";
  }
}

export function safeDecryptAttachmentName(input: {
  attachmentName?: string | null;
  attachmentNameNonce?: string | null;
  attachmentNameVersion?: number | null;
}): string | null {
  try {
    return decryptAttachmentName(input);
  } catch (err) {
    console.error("[chat-crypto] attachment name decrypt failed", err);
    return input.attachmentName ? "[encrypted file]" : null;
  }
}
