import { Form, useLoaderData } from "@remix-run/react";
import {
  ActionArgs,
  json,
  LoaderArgs,
  redirect,
} from "@remix-run/server-runtime";
import { useState } from "react";
import { getTwitchIntegrationForUserId } from "~/models/twitch.server";
import { authenticator } from "~/services/auth.server";
import { apiClient, authProvider } from "~/services/twitch.server";
import { get } from "~/utils/fetch";

export async function loader({ request }: LoaderArgs) {
  // Redirect to /onboarding if we the user has not been onboarded
  // @link: https://github.com/sergiodxa/remix-auth#custom-redirect-url-based-on-the-user

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });

  const response = await get("/twitch-bot/onboarded", { userId: user.id });

  if (!response.isOnboarded) {
    return redirect("/onboarding");
  }

  const twitchIntegration = await getTwitchIntegrationForUserId(user.id);

  return json({
    user,
    twitchIntegration,
  });
}

export default function DashboardPage() {
  const {
    user: { id },
    twitchIntegration: { twitchChannelName },
  } = useLoaderData<typeof loader>();
  const [loading, setLoading] = useState(false);

  console.log("dashboard page");
  return (
    <main className="flex flex-col">
      <h1>Hi, i'm Logged In and my ID is {id}</h1>
      <h1>My channel name is {twitchChannelName}</h1>
      <Form action="/logout" method="post">
        <button>Logout</button>
      </Form>

      <button
        onClick={async () => {
          setLoading(true);
          console.log(`clicked button to join ${twitchChannelName}`);
          // @TODO: @PROD: fix these URLs when we go to prod
          const url = "http://localhost:3000/twitch-bot/channels/join";
          const data = { channel: twitchChannelName };
          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          };
          const currentChannels = await (await fetch(url, options)).json();
          console.log(currentChannels);
          setLoading(false);
        }}
      >
        Join Channel
        {loading ? "loading" : "not loading"}
      </button>
      <button
        onClick={async () => {
          console.log(`clicked set mod button`);
          // @TODO: @PROD: fix these URLs when we go to prod
          const url = "http://localhost:3000/twitch-bot/channels/mod";
          const data = { userId: id };
          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          };
          const currentChannels = await (await fetch(url, options)).json();
          console.log(currentChannels);
          setLoading(false);
        }}
      >
        test
      </button>
    </main>
  );
}
