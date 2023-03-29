import { ApiClient } from "@twurple/api";
import { RefreshingAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import { moderate } from "~/bot/mod/openai.server";
import {
  getTwitchTokensForUserId,
  setTwitchAccessToken,
} from "~/models/twitch.server";

const clientId = process.env.TWITCH_CLIENT_ID!;
const clientSecret = process.env.TWITCH_CLIENT_SECRET!;
const modbotId = process.env.MODBOT_USER_ID;

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

const chatClient = new ChatClient({
  authProvider,
  channels: ["jenntacles"],
  isAlwaysMod: true, // we are always a mod in joined channels. raises rate limit and lifts one-second-between messages rule
});

const apiClient = new ApiClient({
  authProvider,
});

chatClient.onMessage(async (channel, user, text, message) => {
  if (!modbotId) return;
  console.log(`${channel} @${user}: ${text}`);
  // const flagged = await moderate(text);
  // console.log(`openai says: ${flagged}`);
  // console.log(message.channelId);
  // console.log(message.id);

  // if (flagged) {
  //   // @TODO
  //   // If OpenAI flags the message,
  //   // we delete it and store it in our db (?)
  //   const broadercasterTwitchId =
  //     "twitchId of broadcaster/user of the app. need to get this";
  //   await apiClient.moderation.deleteChatMessages(
  //     broadercasterTwitchId,
  //     modbotId,
  //     message.id
  //   );
  // }
});

chatClient.onJoinFailure((channel, reason) => {
  console.error(
    `TwitchChatClient Error: Couldn't join channel ${channel} for reason ${reason}`
  );
});

chatClient.onJoin((channel, user) => {
  console.log(`TwitchChatClient: ${user} joined ${channel}`);
});

chatClient.onAuthenticationSuccess(() => {
  console.log("init chat client, here are its current channel");
  console.log(chatClient.currentChannels);
});

export async function init() {
  if (!modbotId) return;
  const modbotTokens = await getTwitchTokensForUserId(modbotId);

  await authProvider.addUserForToken(
    {
      accessToken: modbotTokens.accessToken,
      refreshToken: modbotTokens.refreshToken,
      obtainmentTimestamp: 0,
      expiresIn: 0,
    },
    ["chat"] // @NOTE: https://twurple.js.org/docs/auth/concepts/intents.html
  );
  await chatClient.connect();
}

export { chatClient, authProvider, apiClient };
