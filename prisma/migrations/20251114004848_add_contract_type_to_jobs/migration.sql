-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE');

-- AlterTable
ALTER TABLE "Jobs" ADD COLUMN     "contract_type" "ContractType" NOT NULL DEFAULT 'FULL_TIME';
