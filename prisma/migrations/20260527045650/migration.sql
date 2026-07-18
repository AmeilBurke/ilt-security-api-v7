/*
  Warnings:

  - A unique constraint covering the columns `[personId]` on the table `Alert` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Alert_personId_key" ON "Alert"("personId");
