-- AlterEnum: support desk role (inquiries + limited invites; no client chat)
ALTER TYPE "Role" ADD VALUE 'SUB_ADMIN';

-- AlterTable: message body encryption at rest (AES-256-GCM envelope)
ALTER TABLE "Message" ADD COLUMN "bodyNonce" TEXT;
ALTER TABLE "Message" ADD COLUMN "bodyVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Message" ADD COLUMN "attachmentNameNonce" TEXT;
ALTER TABLE "Message" ADD COLUMN "attachmentNameVersion" INTEGER NOT NULL DEFAULT 0;
