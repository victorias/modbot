import type {
  Password,
  TwitchAccessToken,
  TwitchIntegration,
  User,
} from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByTwitchId(id: TwitchIntegration["id"]) {
  return prisma.user.findFirst({ where: { twitchIntegration: { id } } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser({
  email,
  password,
  displayName,
  profileImageUrl,
}: {
  email: User["email"];
  password?: string;
  displayName?: User["displayName"];
  profileImageUrl?: User["profileImageUrl"];
}) {
  // Password is optional, only use it if user did not use social-login
  let passwordObj = {};
  if (password) {
    passwordObj = {
      password: { create: { hash: await bcrypt.hash(password, 10) } },
    };
  }

  return prisma.user.create({
    data: {
      email,
      displayName,
      profileImageUrl,
      ...passwordObj,
    },
  });
}

export async function createTwitchUser({
  email,
  displayName,
  profileImageUrl,
  twitchId,
  twitchLogin,
}: {
  email: User["email"];
  displayName?: User["displayName"];
  profileImageUrl?: User["profileImageUrl"];
  twitchId: TwitchIntegration["id"];
  twitchLogin: TwitchIntegration["twitchLogin"];
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
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
