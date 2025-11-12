-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "verify_token" VARCHAR(255),
ADD COLUMN     "verify_token_expired_at" TIMESTAMP(3);
