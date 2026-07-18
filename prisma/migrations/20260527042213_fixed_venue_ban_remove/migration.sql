-- CreateTable
CREATE TABLE "VenueBan" (
    "id" TEXT NOT NULL,
    "banId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,

    CONSTRAINT "VenueBan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VenueBan_banId_venueId_key" ON "VenueBan"("banId", "venueId");

-- AddForeignKey
ALTER TABLE "VenueBan" ADD CONSTRAINT "VenueBan_banId_fkey" FOREIGN KEY ("banId") REFERENCES "Ban"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueBan" ADD CONSTRAINT "VenueBan_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
