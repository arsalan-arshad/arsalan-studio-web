-- AlterTable: allow ADMIN to deactivate SUB_ADMIN / CLIENT accounts
ALTER TABLE "User" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
