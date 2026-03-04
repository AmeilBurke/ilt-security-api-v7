/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Ban` table. All the data in the column will be lost.
  - You are about to drop the column `incidentDate` on the `Ban` table. All the data in the column will be lost.
  - You are about to drop the column `initialDuration` on the `Ban` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Ban` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `BannedPerson` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `BannedPerson` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `DutyManager` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `VenueBan` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `VenueBan` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `VenueManager` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `duration` to the `Ban` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ban" DROP CONSTRAINT "Ban_createdById_fkey";

-- DropForeignKey
ALTER TABLE "DutyManager" DROP CONSTRAINT "DutyManager_userId_fkey";

-- DropForeignKey
ALTER TABLE "VenueManager" DROP CONSTRAINT "VenueManager_userId_fkey";

-- DropIndex
DROP INDEX "Ban_createdById_idx";

-- DropIndex
DROP INDEX "Ban_isBlanketBan_idx";

-- DropIndex
DROP INDEX "Ban_personId_idx";

-- DropIndex
DROP INDEX "Ban_status_idx";

-- DropIndex
DROP INDEX "DutyManager_userId_idx";

-- DropIndex
DROP INDEX "DutyManager_venueId_idx";

-- DropIndex
DROP INDEX "VenueBan_banId_idx";

-- DropIndex
DROP INDEX "VenueBan_endDate_idx";

-- DropIndex
DROP INDEX "VenueBan_isActive_idx";

-- DropIndex
DROP INDEX "VenueBan_venueId_idx";

-- DropIndex
DROP INDEX "VenueManager_userId_idx";

-- DropIndex
DROP INDEX "VenueManager_venueId_idx";

-- AlterTable
ALTER TABLE "Ban" DROP COLUMN "createdAt",
DROP COLUMN "incidentDate",
DROP COLUMN "initialDuration",
DROP COLUMN "updatedAt",
ADD COLUMN     "duration" "BanDuration" NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "BannedPerson" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "DutyManager" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "Venue" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "VenueBan" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "VenueManager" DROP COLUMN "createdAt";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- AddForeignKey
ALTER TABLE "VenueManager" ADD CONSTRAINT "VenueManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutyManager" ADD CONSTRAINT "DutyManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ban" ADD CONSTRAINT "Ban_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
