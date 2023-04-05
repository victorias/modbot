/*
  Warnings:

  - Changed the type of `twitchResponseStatusCode` on the `TwitchMessage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TwitchMessage" DROP COLUMN "twitchResponseStatusCode",
ADD COLUMN     "twitchResponseStatusCode" INTEGER NOT NULL;
