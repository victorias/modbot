import {
  TwitchAccessToken,
  TwitchIntegration,
  TwitchMessage,
  User,
} from "@prisma/client";
import { prisma } from "~/db.server";
import { getUserByTwitchId } from "./user.server";

const modbotId = process.env.MODBOT_USER_ID;

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

export async function getModbotTwitchIntegration() {
  return getTwitchIntegrationForUserId(modbotId!);
}

export async function getTwitchIntegrationForChannelId(
  channelId: TwitchIntegration["twitchChannelId"]
) {
  return prisma.twitchIntegration.findUnique({
    where: {
      twitchChannelId: channelId,
    },
  });
}

export async function getAllTwitchChannels() {
  return prisma.twitchIntegration.findMany({
    select: {
      twitchChannelName: true,
    },
  });
}

export async function getAllTwitchTokens() {
  return prisma.twitchAccessToken.findMany({
    include: {
      user: {
        select: {
          id: true,
          twitchIntegration: true,
        },
      },
    },
  });
}

export async function createTwitchMessage({
  broadcasterId,
  messageId,
  sentAt,
  content,
  isFlagged,
  senderTwitchUsername,
  moderation,
  twitchResponseStatusCode,
}: {
  broadcasterId: TwitchIntegration["id"];
  messageId: TwitchMessage["id"];
  sentAt: TwitchMessage["sentAt"];
  content: TwitchMessage["content"];
  senderTwitchUsername: TwitchMessage["senderTwitchUsername"];
  isFlagged: TwitchMessage["isFlagged"];
  twitchResponseStatusCode?: TwitchMessage["twitchResponseStatusCode"];
  moderation: {};
}) {
  return prisma.twitchMessage.create({
    data: {
      id: messageId,
      twitchIntegrationId: broadcasterId,
      sentAt,
      content,
      senderTwitchUsername,
      isFlagged,
      moderation,
      twitchResponseStatusCode,
    },
  });
}
