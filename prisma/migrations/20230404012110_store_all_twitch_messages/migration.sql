/*
  Warnings:

  - You are about to drop the `DeletedTwitchMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeletedTwitchMessage" DROP CONSTRAINT "DeletedTwitchMessage_twitchIntegrationId_fkey";

-- DropTable
DROP TABLE "DeletedTwitchMessage";

-- CreateTable
CREATE TABLE "TwitchMessage" (
    "id" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "senderTwitchUsername" TEXT NOT NULL,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "moderation" JSONB NOT NULL,
    "twitchIntegrationId" TEXT NOT NULL,

    CONSTRAINT "TwitchMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TwitchMessage" ADD CONSTRAINT "TwitchMessage_twitchIntegrationId_fkey" FOREIGN KEY ("twitchIntegrationId") REFERENCES "TwitchIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
