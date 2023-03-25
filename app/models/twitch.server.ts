import { TwitchAccessToken, User } from "@prisma/client";
import { prisma } from "~/db.server";

export async function setTwitchAccessToken({
  userId,
  accessToken,
  refreshToken,
  expiresIn,
  obtainmentTimestamp,
}: {
  userId: User["id"];
  accessToken: TwitchAccessToken["accessToken"];
  refreshToken: TwitchAccessToken["refreshToken"];
  expiresIn?: TwitchAccessToken["expiresIn"];
  obtainmentTimestamp?: TwitchAccessToken["obtainmentTimestamp"];
}) {
  console.log(
    `called set twitch access token for ${userId} with ${expiresIn} and ${obtainmentTimestamp}`
  );
  let token: TwitchAccessToken;
  try {
    token = await prisma.twitchAccessToken.upsert({
      where: {
        userId,
      },
      update: {
        accessToken,
        refreshToken,
        expiresIn,
        obtainmentTimestamp,
      },
      create: {
        accessToken,
        refreshToken,
        obtainmentTimestamp: obtainmentTimestamp || Date.now(),
        userId: userId,
      },
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
  return token;
}
