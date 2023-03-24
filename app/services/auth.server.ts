import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { TwitchStrategy } from "@03gibbss/remix-auth-twitch";
import { getUserByTwitchId } from "~/models/user.server";

const scopes = [
  "channel:moderate",
  "channel:read:subscriptions",
  "channel:read:redemptions",
  "channel:read:hype_train",
  "user:edit",
  "user:edit:broadcast",
  "user:read:email",
];

type User = { id: string };

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage);

let twitchStrategy = new TwitchStrategy(
  {
    clientID: process.env.TWITCH_CLIENT_ID!,
    clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    callbackURL: `${process.env.MODBOT_URL}/auth/twitch/callback`,
    scope: scopes.join(" "),
  },
  async ({ accessToken, extraParams, profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    console.log({ profile });
    const user = await getUserByTwitchId(profile.id);

    if (user) {
      return { id: user.id };
    }

    // No user so first login and we have to make a new one
    console.log("no user");
    return { id: "null" };
  }
);

authenticator.use(twitchStrategy);
