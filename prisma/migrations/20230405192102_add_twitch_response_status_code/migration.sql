/*
  Warnings:

  - Added the required column `twitchResponseStatusCode` to the `TwitchMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TwitchMessage" ADD COLUMN     "twitchResponseStatusCode" TEXT NOT NULL;
