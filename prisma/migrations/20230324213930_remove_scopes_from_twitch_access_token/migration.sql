/*
  Warnings:

  - You are about to drop the column `scope` on the `TwitchAccessToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TwitchAccessToken" DROP COLUMN "scope";
