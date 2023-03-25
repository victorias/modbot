/*
  Warnings:

  - The `expiresIn` column on the `TwitchAccessToken` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `obtainmentTimestamp` column on the `TwitchAccessToken` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TwitchAccessToken" DROP COLUMN "expiresIn",
ADD COLUMN     "expiresIn" TIMESTAMP(3),
DROP COLUMN "obtainmentTimestamp",
ADD COLUMN     "obtainmentTimestamp" TIMESTAMP(3);
