/*
  Warnings:

  - You are about to drop the column `endDate` on the `Ban` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ban" DROP COLUMN "endDate";

-- CreateTable
CREATE TABLE "VenueBan" (
    "id" TEXT NOT NULL,
    "banId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "VenueBan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VenueBan_banId_venueId_key" ON "VenueBan"("banId", "venueId");

-- AddForeignKey
ALTER TABLE "VenueBan" ADD CONSTRAINT "VenueBan_banId_fkey" FOREIGN KEY ("banId") REFERENCES "Ban"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueBan" ADD CONSTRAINT "VenueBan_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
