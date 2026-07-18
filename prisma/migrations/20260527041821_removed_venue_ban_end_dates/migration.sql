/*
  Warnings:

  - You are about to drop the `VenueBan` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endDate` to the `Ban` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VenueBan" DROP CONSTRAINT "VenueBan_banId_fkey";

-- DropForeignKey
ALTER TABLE "VenueBan" DROP CONSTRAINT "VenueBan_venueId_fkey";

-- AlterTable
ALTER TABLE "Ban" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "VenueBan";
