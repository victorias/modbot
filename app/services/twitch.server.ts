import { ApiClient } from "@twurple/api";
import { HttpStatusCodeError } from "@twurple/api-call";
import { RefreshingAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import { moderate } from "~/bot/mod/openai.server";
import {
  createTwitchMessage,
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
  const { flagged, ...moderation } = await moderate(text);
  // console.log(`${channel} @${user}: ${text}`);

  // Store all messages in our db for now
  // @TODO: ignore certain messages, like cheers, redemptions, highlights, mod messages?
  if (message.channelId) {
    const twitchIntegration = await getTwitchIntegrationForChannelId(
      message.channelId
    );
    let statusCode;
    if (twitchIntegration) {
      if (flagged) {
        // if flagged, delete it
        const modbotTwitchIntegration = await getModbotTwitchIntegration();
        const broadercasterTwitchId = twitchIntegration.id;
        statusCode = 204; // successfully removed message
        if (broadercasterTwitchId) {
          try {
            await apiClient.moderation.deleteChatMessages(
              broadercasterTwitchId,
              modbotTwitchIntegration.id,
              message.id
            );
          } catch (e: any) {
            statusCode = e.statusCode;
            switch (e.statusCode) {
              case 400:
                // tried to delete a mod message, just ignore this
                break;
              case 401:
                // unauthorized, @TODO
                break;
              case 403:
                // we are not a mod, @TODO
                break;
              case 404:
                // message id was not found, or message was sent >6 hours ago. ignore this
                break;
              default:
                // unhandled status code error, or statusCode is undefined and it's an internal error
                // @TODO: log this state to sentry
                break;
            }
          }
        }
      }

      await createTwitchMessage({
        broadcasterId: twitchIntegration.id,
        messageId: message.id,
        sentAt: message.date,
        senderTwitchUsername: user,
        content: text,
        isFlagged: flagged,
        moderation,
        twitchResponseStatusCode: statusCode,
      });
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
  tokens.map(
    ({
      user: { twitchIntegration, id },
      accessToken,
      refreshToken,
      obtainmentTimestamp,
      expiresIn,
    }) => {
      return authProvider.addUser(
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
