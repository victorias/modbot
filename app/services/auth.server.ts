import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { TwitchStrategy } from "@03gibbss/remix-auth-twitch";
import { createTwitchUser, getUserByTwitchId } from "~/models/user.server";
import { RefreshingAuthProvider } from "@twurple/auth";
import { setTwitchAccessToken } from "~/models/twitch.server";

const scopes = [
  "channel:moderate",
  "channel:read:subscriptions",
  "channel:read:redemptions",
  "channel:read:hype_train",
  "user:edit",
  "user:edit:broadcast",
  "user:read:email",
];

const scope = scopes.join(" ");
const clientId = process.env.TWITCH_CLIENT_ID!;
const clientSecret = process.env.TWITCH_CLIENT_SECRET!;

const authProvider = new RefreshingAuthProvider({
  clientId,
  clientSecret,
  onRefresh: async (
    userId,
    { accessToken, expiresIn, obtainmentTimestamp, refreshToken }
  ) => {
    await setTwitchAccessToken({
      userId,
      accessToken,
      refreshToken,
      expiresIn,
      obtainmentTimestamp: BigInt(obtainmentTimestamp),
    });
  },
});

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
    let user: User | null = await getUserByTwitchId(profile.id);

    if (!!!user) {
      // We didn't find a user which means this is their first login
      // Time to make a new user!
      user = await createTwitchUser({
        email,
        twitchId,
        displayName: display_name,
        twitchLogin: login,
        profileImageUrl: profile_image_url,
      });
    }

    // Store their accessToken
    console.log("my set");
    await setTwitchAccessToken({ userId: user.id, accessToken, refreshToken });

    await authProvider.addUser(twitchId, {
      accessToken,
      refreshToken,
      expiresIn: 0,
      obtainmentTimestamp: 0,
    });

    console.log("stored to authprovider");

    return { id: user.id };
  }
);

authenticator.use(twitchStrategy);
