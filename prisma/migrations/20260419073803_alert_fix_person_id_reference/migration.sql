/*
  Warnings:

  - You are about to drop the column `bannedPersonId` on the `Alert` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_bannedPersonId_fkey";

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "bannedPersonId";

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_personId_fkey" FOREIGN KEY ("personId") REFERENCES "BannedPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
