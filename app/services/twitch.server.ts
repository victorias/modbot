import { RefreshingAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import {
  getTwitchTokensForUserId,
  setTwitchAccessToken,
} from "~/models/twitch.server";

const clientId = process.env.TWITCH_CLIENT_ID!;
const clientSecret = process.env.TWITCH_CLIENT_SECRET!;
const modbotId = process.env.MODBOT_USER_ID!;

const authProvider = new RefreshingAuthProvider({
  clientId,
  clientSecret,
  onRefresh: async (
    twitchUserId,
    { accessToken, expiresIn, obtainmentTimestamp, refreshToken }
  ) => {
    console.log(`authprovider updating token for ${twitchUserId}`);
    console.log(
      `called set twitch access token for ${twitchUserId} with ${expiresIn} and ${obtainmentTimestamp}`
    );
    await setTwitchAccessToken({
      twitchId: twitchUserId,
      accessToken,
      refreshToken,
      expiresIn,
      obtainmentTimestamp: BigInt(obtainmentTimestamp),
    });
  },
});

const chatClient = new ChatClient({ authProvider, channels: ["jenntacles"] });

chatClient.onMessage((channel, user, text) => {
  console.log(`${user}: ${text}`);
});

export async function init() {
  const modbotTokens = await getTwitchTokensForUserId(modbotId);

  await authProvider.addUserForToken(
    {
      accessToken: modbotTokens.accessToken,
      refreshToken: modbotTokens.refreshToken,
      obtainmentTimestamp: 0,
      expiresIn: 0,
    },
    ["chat"]
  );
  await chatClient.connect();
}

export { chatClient, authProvider };
