-- Additive migration for the deterministic order-confirmation gate.
-- Creates a single new table: no existing table, column or row is touched.

-- CreateTable
CREATE TABLE "PendingOrderConfirmation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT,
    "externalMessageId" TEXT,
    "cartFingerprint" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingOrderConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingOrderConfirmation_userId_key" ON "PendingOrderConfirmation"("userId");

-- CreateIndex
CREATE INDEX "PendingOrderConfirmation_userId_idx" ON "PendingOrderConfirmation"("userId");

-- CreateIndex
CREATE INDEX "PendingOrderConfirmation_expiresAt_idx" ON "PendingOrderConfirmation"("expiresAt");
