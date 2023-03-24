/*
  Warnings:

  - Added the required column `twitchLogin` to the `TwitchIntegration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TwitchIntegration" ADD COLUMN     "twitchLogin" TEXT NOT NULL;
