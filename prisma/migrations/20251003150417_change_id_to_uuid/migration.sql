/*
  Warnings:

  - The primary key for the `CompanyAdmins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `changed_by` column on the `Interviews` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `approved_by` column on the `Subscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UserSkills` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `changed_by` on the `ApplicationHistories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `Applications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `CompanyAdmins` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `Subscriptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `UserAuthProviders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `UserSkills` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ApplicationHistories" DROP CONSTRAINT "ApplicationHistories_changed_by_fkey";

-- DropForeignKey
ALTER TABLE "Applications" DROP CONSTRAINT "Applications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "CompanyAdmins" DROP CONSTRAINT "CompanyAdmins_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Interviews" DROP CONSTRAINT "Interviews_changed_by_fkey";

-- DropForeignKey
ALTER TABLE "Subscriptions" DROP CONSTRAINT "Subscriptions_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "Subscriptions" DROP CONSTRAINT "Subscriptions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserAuthProviders" DROP CONSTRAINT "UserAuthProviders_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserSkills" DROP CONSTRAINT "UserSkills_user_id_fkey";

-- AlterTable
ALTER TABLE "ApplicationHistories" DROP COLUMN "changed_by",
ADD COLUMN     "changed_by" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Applications" DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "CompanyAdmins" DROP CONSTRAINT "CompanyAdmins_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "CompanyAdmins_pkey" PRIMARY KEY ("user_id", "company_id");

-- AlterTable
ALTER TABLE "Interviews" DROP COLUMN "changed_by",
ADD COLUMN     "changed_by" UUID;

-- AlterTable
ALTER TABLE "Subscriptions" DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "approved_by",
ADD COLUMN     "approved_by" UUID;

-- AlterTable
ALTER TABLE "UserAuthProviders" DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "UserSkills" DROP CONSTRAINT "UserSkills_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "UserSkills_pkey" PRIMARY KEY ("user_id", "tag_id");

-- AlterTable
ALTER TABLE "Users" DROP CONSTRAINT "Users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Applications_user_id_job_id_key" ON "Applications"("user_id", "job_id");

-- AddForeignKey
ALTER TABLE "UserAuthProviders" ADD CONSTRAINT "UserAuthProviders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAdmins" ADD CONSTRAINT "CompanyAdmins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applications" ADD CONSTRAINT "Applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationHistories" ADD CONSTRAINT "ApplicationHistories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interviews" ADD CONSTRAINT "Interviews_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkills" ADD CONSTRAINT "UserSkills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
