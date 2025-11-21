-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "city_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "Cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
