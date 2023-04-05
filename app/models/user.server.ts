import type { TwitchIntegration, User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByTwitchId(id: TwitchIntegration["id"]) {
  return prisma.user.findFirst({ where: { twitchIntegration: { id } } });
}

export async function getUserByEmail(email: User["email"]) {
  // return prisma.user.findUnique({ where: { email } });
}

export async function createTwitchUser({
  email,
  displayName,
  profileImageUrl,
  twitchId,
  twitchLogin,
  twitchChannelName,
  twitchChannelId,
}: {
  email: User["email"];
  displayName?: User["displayName"];
  profileImageUrl?: User["profileImageUrl"];
  twitchId: TwitchIntegration["id"];
  twitchLogin: TwitchIntegration["twitchLogin"];
  twitchChannelName: TwitchIntegration["twitchChannelName"];
  twitchChannelId: TwitchIntegration["twitchChannelId"];
}) {
  // Note: Prisma only allows 1 create, so we cannot also create
  // access token in the same query
  return prisma.user.create({
    data: {
      email,
      displayName,
      profileImageUrl,
      twitchIntegration: {
        create: {
          id: twitchId,
          twitchLogin,
          twitchChannelId,
          twitchChannelName,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  // return prisma.user.delete({ where: { email } });
}
