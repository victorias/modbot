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
    twitchIntegration: { twitchChannelName },
  } = useLoaderData<typeof loader>();

  return (
    <main className="mt-10 flex align-middle font-mono">
      <div className="grid-rows-12 m-auto grid max-h-fit max-w-screen-xl grid-cols-6 justify-center p-10  lg:w-10/12">
        <div className="col-span-7 col-start-1 row-start-1 flex flex-col justify-between border-b-2 lg:flex-row">
          <h1 className="text-4xl sm:m-6 sm:text-5xl lg:m-8 lg:text-6xl">
            modbot
          </h1>

          <h2 className="sm:m-6 lg:m-8">AI-powered Twitch chat moderator</h2>
        </div>

        <div className="col-start-2 col-end-6 row-start-2 pt-6 leading-loose lg:pt-8">
          <p className="mb-4 leading-normal">
            You've successfully connected modbotapp to{" "}
            <b>{twitchChannelName}</b> on Twitch!
          </p>
          <p className="mb-4 leading-normal">
            <b>modbotapp</b> is now automatically monitoring your channel's chat
            messages.
          </p>
          <p className="mb-4 leading-normal">
            Questions? Chat with us on{" "}
            <a
              href="https://discord.gg/KBEbzMxG78"
              target="__blank"
              className="underline"
            >
              Discord
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
