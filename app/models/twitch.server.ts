import { TwitchAccessToken, TwitchIntegration, User } from "@prisma/client";
import { prisma } from "~/db.server";
import { getUserByTwitchId } from "./user.server";

export async function setTwitchAccessToken({
  twitchId,
  accessToken,
  refreshToken,
  expiresIn,
  obtainmentTimestamp,
}: {
  twitchId: TwitchIntegration["id"];
  accessToken: TwitchAccessToken["accessToken"];
  refreshToken: TwitchAccessToken["refreshToken"];
  expiresIn?: TwitchAccessToken["expiresIn"];
  obtainmentTimestamp?: TwitchAccessToken["obtainmentTimestamp"];
}) {
  const user = await getUserByTwitchId(twitchId);

  if (!user) {
    throw new Error(
      `No user found for twitch Id ${twitchId} when setting Twitch Access Token`
    );
  }

  let token: TwitchAccessToken;
  try {
    token = await prisma.twitchAccessToken.upsert({
      where: {
        userId: user.id,
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
        userId: user.id,
      },
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
  return token;
}

export async function getTwitchTokensForUserId(userId: User["id"]) {
  return prisma.twitchAccessToken.findUniqueOrThrow({
    where: {
      userId,
    },
  });
}

export async function getTwitchIntegrationForUserId(userId: User["id"]) {
  return prisma.twitchIntegration.findUniqueOrThrow({
    where: {
      userId,
    },
  });
}
