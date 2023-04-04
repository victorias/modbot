-- CreateTable
CREATE TABLE "DeletedTwitchMessage" (
    "id" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "senderTwitchUsername" TEXT NOT NULL,
    "twitchIntegrationId" TEXT NOT NULL,

    CONSTRAINT "DeletedTwitchMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeletedTwitchMessage" ADD CONSTRAINT "DeletedTwitchMessage_twitchIntegrationId_fkey" FOREIGN KEY ("twitchIntegrationId") REFERENCES "TwitchIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
