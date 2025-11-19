-- AlterTable
ALTER TABLE "Applications" ADD COLUMN     "cover_letter_file_url" VARCHAR(255),
ADD COLUMN     "extra_info" JSONB;
