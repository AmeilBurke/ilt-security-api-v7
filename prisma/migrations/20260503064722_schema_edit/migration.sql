/*
  Warnings:

  - You are about to drop the column `duration` on the `Ban` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `VenueBan` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `VenueBan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ban" DROP COLUMN "duration";

-- AlterTable
ALTER TABLE "VenueBan" DROP COLUMN "isActive",
DROP COLUMN "startDate";

-- DropEnum
DROP TYPE "BanDuration";
