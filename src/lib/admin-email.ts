import { brand } from "@/lib/brand";

/** Allowed From addresses for the admin email composer. */
export const ADMIN_EMAIL_FROM_ADDRESSES = [
  `contact@${brand.domain}`,
  `hello@${brand.domain}`,
  `info@${brand.domain}`,
  `noreply@${brand.domain}`,
  `support@${brand.domain}`,
  `arsalan@${brand.domain}`,
] as const;

export type AdminEmailFromAddress =
  (typeof ADMIN_EMAIL_FROM_ADDRESSES)[number];

/**
 * Resend allows emails up to 40MB after Base64 encoding of attachments.
 * Cap raw attachment bytes below that so Base64 (~4/3) stays under the limit.
 */
export const ADMIN_EMAIL_MAX_ATTACHMENT_BYTES = 30 * 1024 * 1024;

export function isAdminEmailFromAddress(
  value: string,
): value is AdminEmailFromAddress {
  return (ADMIN_EMAIL_FROM_ADDRESSES as readonly string[]).includes(value);
}
