/*
  Warnings:

  - The primary key for the `CompanyAdmins` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserSkills` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.

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
ALTER TABLE "ApplicationHistories" ALTER COLUMN "changed_by" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Applications" ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "CompanyAdmins" DROP CONSTRAINT "CompanyAdmins_pkey",
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CompanyAdmins_pkey" PRIMARY KEY ("user_id", "company_id");

-- AlterTable
ALTER TABLE "Interviews" ALTER COLUMN "changed_by" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Subscriptions" ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "approved_by" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UserAuthProviders" ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UserSkills" DROP CONSTRAINT "UserSkills_pkey",
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserSkills_pkey" PRIMARY KEY ("user_id", "tag_id");

-- AlterTable
ALTER TABLE "Users" DROP CONSTRAINT "Users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "role" SET DEFAULT 'JOB_SEEKER',
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Users_id_seq";

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
