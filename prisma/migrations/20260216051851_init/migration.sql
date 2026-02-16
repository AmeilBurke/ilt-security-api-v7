-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VENUE_MANAGER', 'DUTY_MANAGER', 'BOUNCER');

-- CreateEnum
CREATE TYPE "BanStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BanDuration" AS ENUM ('ONE_MONTH', 'THREE_MONTHS', 'SIX_MONTHS', 'ONE_YEAR', 'TWO_YEARS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueManager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenueManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DutyManager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DutyManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannedPerson" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannedPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ban" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "incidentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initialDuration" "BanDuration" NOT NULL,
    "isBlanketBan" BOOLEAN NOT NULL DEFAULT false,
    "status" "BanStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ban_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueBan" (
    "id" TEXT NOT NULL,
    "banId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueBan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "VenueManager_userId_idx" ON "VenueManager"("userId");

-- CreateIndex
CREATE INDEX "VenueManager_venueId_idx" ON "VenueManager"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "VenueManager_userId_venueId_key" ON "VenueManager"("userId", "venueId");

-- CreateIndex
CREATE INDEX "DutyManager_userId_idx" ON "DutyManager"("userId");

-- CreateIndex
CREATE INDEX "DutyManager_venueId_idx" ON "DutyManager"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "DutyManager_userId_venueId_key" ON "DutyManager"("userId", "venueId");

-- CreateIndex
CREATE INDEX "Ban_personId_idx" ON "Ban"("personId");

-- CreateIndex
CREATE INDEX "Ban_createdById_idx" ON "Ban"("createdById");

-- CreateIndex
CREATE INDEX "Ban_status_idx" ON "Ban"("status");

-- CreateIndex
CREATE INDEX "Ban_isBlanketBan_idx" ON "Ban"("isBlanketBan");

-- CreateIndex
CREATE INDEX "VenueBan_banId_idx" ON "VenueBan"("banId");

-- CreateIndex
CREATE INDEX "VenueBan_venueId_idx" ON "VenueBan"("venueId");

-- CreateIndex
CREATE INDEX "VenueBan_isActive_idx" ON "VenueBan"("isActive");

-- CreateIndex
CREATE INDEX "VenueBan_endDate_idx" ON "VenueBan"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "VenueBan_banId_venueId_key" ON "VenueBan"("banId", "venueId");

-- AddForeignKey
ALTER TABLE "VenueManager" ADD CONSTRAINT "VenueManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueManager" ADD CONSTRAINT "VenueManager_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutyManager" ADD CONSTRAINT "DutyManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutyManager" ADD CONSTRAINT "DutyManager_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ban" ADD CONSTRAINT "Ban_personId_fkey" FOREIGN KEY ("personId") REFERENCES "BannedPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ban" ADD CONSTRAINT "Ban_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueBan" ADD CONSTRAINT "VenueBan_banId_fkey" FOREIGN KEY ("banId") REFERENCES "Ban"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueBan" ADD CONSTRAINT "VenueBan_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
