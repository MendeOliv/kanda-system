-- CreateTable
CREATE TABLE "ConversationLock" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationLock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversationLock_conversationId_key" ON "ConversationLock"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationLock_conversationId_idx" ON "ConversationLock"("conversationId");

-- CreateIndex
CREATE INDEX "Brand_slug_idx" ON "Brand"("slug");
