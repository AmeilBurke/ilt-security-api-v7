/*
  Warnings:

  - Made the column `imagePath` on table `Alert` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Alert" ALTER COLUMN "imagePath" SET NOT NULL;
