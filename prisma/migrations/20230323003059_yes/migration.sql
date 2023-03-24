-- CreateTable
CREATE TABLE "TwitchIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TwitchIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitchIntegration_userId_key" ON "TwitchIntegration"("userId");

-- AddForeignKey
ALTER TABLE "TwitchIntegration" ADD CONSTRAINT "TwitchIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
