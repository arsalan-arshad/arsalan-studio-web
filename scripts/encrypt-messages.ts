/**
 * Encrypt legacy plaintext Message.body (+ optional attachment names) in place.
 * Safe to re-run: skips rows with bodyVersion >= 1.
 *
 * Usage: npx tsx scripts/encrypt-messages.ts
 * Requires DATABASE_URL + CHAT_ENCRYPTION_SECRET.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {
  isChatEncryptionConfigured,
  sealedAttachmentNameFields,
  sealedMessageFields,
} from "../src/lib/chat-crypto";

const prisma = new PrismaClient();

async function main() {
  if (!isChatEncryptionConfigured()) {
    console.error("CHAT_ENCRYPTION_SECRET is not set — aborting.");
    process.exit(1);
  }

  const batchSize = 100;
  let encrypted = 0;
  let skipped = 0;

  for (;;) {
    const rows = await prisma.message.findMany({
      where: { bodyVersion: 0 },
      take: batchSize,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        body: true,
        attachmentName: true,
        attachmentNameVersion: true,
      },
    });
    if (!rows.length) break;

    for (const row of rows) {
      const bodyFields = sealedMessageFields(row.body);
      const nameFields =
        row.attachmentName && row.attachmentNameVersion === 0
          ? sealedAttachmentNameFields(row.attachmentName)
          : null;

      await prisma.message.update({
        where: { id: row.id },
        data: {
          ...bodyFields,
          ...(nameFields
            ? {
                attachmentName: nameFields.attachmentName,
                attachmentNameNonce: nameFields.attachmentNameNonce,
                attachmentNameVersion: nameFields.attachmentNameVersion,
              }
            : {}),
        },
      });
      encrypted += 1;
    }
  }

  const remaining = await prisma.message.count({ where: { bodyVersion: 0 } });
  skipped = remaining;
  console.log(`Encrypted ${encrypted} message(s). Remaining plaintext: ${skipped}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
