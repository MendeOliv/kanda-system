-- CreateTable
CREATE TABLE "ProcessedMessage" (
    "id" TEXT NOT NULL,
    "externalMessageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedMessage_externalMessageId_key" ON "ProcessedMessage"("externalMessageId");

-- CreateIndex
CREATE INDEX "ProcessedMessage_userId_idx" ON "ProcessedMessage"("userId");