/*
  Warnings:

  - A unique constraint covering the columns `[twitchChannelId]` on the table `TwitchIntegration` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TwitchIntegration" ALTER COLUMN "twitchChannelId" DROP DEFAULT,
ALTER COLUMN "twitchChannelName" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "TwitchIntegration_twitchChannelId_key" ON "TwitchIntegration"("twitchChannelId");
