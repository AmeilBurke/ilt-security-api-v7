-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "bannedPersonId" TEXT;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_bannedPersonId_fkey" FOREIGN KEY ("bannedPersonId") REFERENCES "BannedPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
