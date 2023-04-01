import { ApiClient } from "@twurple/api";
import { RefreshingAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import { moderate } from "~/bot/mod/openai.server";
import {
  getAllTwitchChannels,
  getAllTwitchTokens,
  getModbotTwitchIntegration,
  getTwitchIntegrationForChannelId,
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

// When the server restarts, we need to rejoin
// all registered channels
async function getTwitchChannelsToJoin() {
  return (await getAllTwitchChannels()).map(
    ({ twitchChannelName }) => twitchChannelName
  );
}

const chatClient = new ChatClient({
  authProvider,
  channels: getTwitchChannelsToJoin,
  isAlwaysMod: true, // we are always a mod in joined channels. raises rate limit and lifts one-second-between messages rule
});

const apiClient = new ApiClient({
  authProvider,
});

chatClient.onMessage(async (channel, user, text, message) => {
  if (!modbotId) return;
  console.log(`${channel} @${user}: ${text}`);
  const { flagged } = await moderate(text);

  if (flagged && message.channelId) {
    // @TODO
    // If OpenAI flags the message,
    // we delete it and store it in our db (?)
    const twitchIntegration = await getTwitchIntegrationForChannelId(
      message.channelId
    );
    const modbotTwitchIntegration = await getModbotTwitchIntegration();
    const broadercasterTwitchId = twitchIntegration?.id;
    if (broadercasterTwitchId) {
      await apiClient.moderation.deleteChatMessages(
        broadercasterTwitchId,
        modbotTwitchIntegration.id,
        message.id
      );
    }
  }
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

async function addUsersToAuthProvider() {
  const tokens = await getAllTwitchTokens();
  return Promise.all(
    tokens.map(
      async ({
        user: { twitchIntegration, id },
        accessToken,
        refreshToken,
        obtainmentTimestamp,
        expiresIn,
      }) => {
        return await authProvider.addUser(
          twitchIntegration!.id,
          {
            accessToken,
            refreshToken,
            obtainmentTimestamp: Number(obtainmentTimestamp),
            expiresIn,
          },
          modbotId === id ? ["moderation", "chat"] : ["moderation"]
        );
      }
    )
  );
}

export async function init() {
  console.log("initializing twitch...");

  if (!modbotId) return;

  console.log("adding users to authprovider");
  await addUsersToAuthProvider();
  console.log(await authProvider.getAccessTokenForIntent("chat"));

  console.log(authProvider.getIntentsForUser("40673593"));

  // const modbotTokens = await getTwitchTokensForUserId(modbotId);

  // await authProvider.addUserForToken(
  //   {
  //     accessToken: modbotTokens.accessToken,
  //     refreshToken: modbotTokens.refreshToken,
  //     obtainmentTimestamp: 0,
  //     expiresIn: 0,
  //   },
  //   ["chat"] // @NOTE: https://twurple.js.org/docs/auth/concepts/intents.html
  // );

  console.log("starting chat client...");
  await chatClient.connect();
}

export { chatClient, authProvider, apiClient };
