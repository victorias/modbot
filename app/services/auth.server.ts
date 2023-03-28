import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { TwitchStrategy } from "@03gibbss/remix-auth-twitch";
import { createTwitchUser, getUserByTwitchId } from "~/models/user.server";
import { RefreshingAuthProvider } from "@twurple/auth";
import { setTwitchAccessToken } from "~/models/twitch.server";
import { apiClient, authProvider, chatClient } from "./twitch.server";

const scopes = [
  "channel:moderate", // Perform moderation actions in a channel. The user requesting the scope must be a moderator in the channel.
  "channel:manage:moderators", //	Add or remove the moderator role from users in your channel.
  "channel:read:editors", // View a list of users with the editor role for a channel.
  "channel:read:subscriptions", // 	View a list of all subscribers to a channel and check if a user is subscribed to a channel.
  "channel:read:vips", // Read the list of VIPs in your channel.
  "channel:read:redemptions", // View Channel Points custom rewards and their redemptions on a channel.
  "channel:read:hype_train", // View Hype Train information for a channel.

  "moderation:read", // View a channel’s moderation data including Moderators, Bans, Timeouts, and Automod settings.
  "moderator:manage:announcements", // 	Send announcements in channels where you have the moderator role.
  "moderator:manage:automod", // Manage messages held for review by AutoMod in channels where you are a moderator.
  "moderator:read:automod_settings", // View a broadcaster’s AutoMod settings.
  "moderator:manage:automod_settings", // Manage a broadcaster’s AutoMod settings.
  "moderator:manage:banned_users", // Ban and unban users.
  "moderator:read:blocked_terms", // View a broadcaster’s list of blocked terms.
  "moderator:manage:blocked_terms", // Manage a broadcaster’s list of blocked terms.
  "moderator:manage:chat_messages", // Delete chat messages in channels where you have the moderator role
  "moderator:read:chat_settings", // View a broadcaster’s chat room settings.
  "moderator:manage:chat_settings", // Manage a broadcaster’s chat room settings.
  "moderator:read:chatters", // View the chatters in a broadcaster’s chat room.
  "moderator:read:followers", // Read the followers of a broadcaster.
  "moderator:read:shield_mode", // View a broadcaster’s Shield Mode status.
  "moderator:manage:shield_mode", // Manage a broadcaster’s Shield Mode status.
  "moderator:read:shoutouts", // View a broadcaster’s shoutouts.
  "moderator:manage:shoutouts", // Manage a broadcaster’s shoutouts.

  "user:manage:blocked_users", // Manage the block list of a user.
  "user:read:blocked_users", // View the block list of a user.
  "user:read:broadcast", // View a user’s broadcasting configuration, including Extension configurations.
  "user:manage:chat_color", // Update the color used for the user’s name in chat

  "user:read:email", // View a user’s email address.

  "chat:read", // View live stream chat messages.
  "chat:edit", // Send live stream chat messages.
];

const scope = scopes.join(" ");
const clientId = process.env.TWITCH_CLIENT_ID!;
const clientSecret = process.env.TWITCH_CLIENT_SECRET!;

type User = { id: string };

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage);

let twitchStrategy = new TwitchStrategy(
  {
    clientID: process.env.TWITCH_CLIENT_ID!,
    clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    callbackURL: `${process.env.MODBOT_URL}/auth/twitch/callback`,
    scope,
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    const {
      id: twitchId,
      email,
      display_name,
      login,
      profile_image_url,
    } = profile;
    let user: User | null = await getUserByTwitchId(twitchId);
    const channel = await apiClient.channels.getChannelInfoById(twitchId);
    console.log(`channel info`);
    console.log(channel?.id);
    console.log(channel?.displayName);

    if (!!!user) {
      // We didn't find a user which means this is their first login
      // Time to make a new user!
      user = await createTwitchUser({
        email,
        twitchId,
        displayName: display_name,
        twitchLogin: login,
        profileImageUrl: profile_image_url,
        twitchChannelId: channel!.id,
        twitchChannelName: channel!.name,
      });
    }

    // Store their accessToken
    await setTwitchAccessToken({ twitchId, accessToken, refreshToken });

    await authProvider.addUserForToken(
      {
        accessToken,
        refreshToken,
        expiresIn: 0,
        obtainmentTimestamp: 0,
      },
      ["chat", "moderation"]
    );

    return { id: user.id };
  }
);

authenticator.use(twitchStrategy);
