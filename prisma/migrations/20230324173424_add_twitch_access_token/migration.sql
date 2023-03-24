-- CreateTable
CREATE TABLE "TwitchAccessToken" (
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "expiresIn" INTEGER,
    "obtainmentTimestamp" INTEGER NOT NULL,
    "refreshToken" TEXT,
    "scope" TEXT NOT NULL,

    CONSTRAINT "TwitchAccessToken_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitchAccessToken_userId_key" ON "TwitchAccessToken"("userId");

-- AddForeignKey
ALTER TABLE "TwitchAccessToken" ADD CONSTRAINT "TwitchAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
