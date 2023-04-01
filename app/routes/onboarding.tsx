import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import { useEffect, useState } from "react";
import { getTwitchIntegrationForUserId } from "~/models/twitch.server";
import { authenticator } from "~/services/auth.server";
import { post } from "~/utils/fetch";

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const twitchIntegration = await getTwitchIntegrationForUserId(user.id);
  return json({
    user,
    twitchIntegration,
  });
}

// We define LoadingSteps as a constant array of strings using the as const assertion to make TypeScript infer the string literal types instead of just string.
const LoadingSteps = [
  "start",
  "joining-channel",
  "making-mod",
  "done",
] as const;
// We define a LoadingStep type that represents a union of all the possible values in the LoadingSteps array. We use the typeof operator to get the type of the LoadingSteps array and then use the number indexed access type to get a union of all its elements.
type LoadingStep = (typeof LoadingSteps)[number];

export default function OnboardingPage() {
  const {
    user: { id },
    twitchIntegration: { twitchChannelName },
  } = useLoaderData<typeof loader>();
  const [currentStep, setCurrentStep] = useState<LoadingStep>("start");
  const navigate = useNavigate();

  useEffect(() => {
    const handleJoinChannel = async () => {
      setTimeout(async () => {
        await post("/twitch-bot/channels/join", { channel: twitchChannelName });
        setCurrentStep("making-mod");
      }, 1500); // 1.5 s delay
    };

    const handleMakeMod = async () => {
      setTimeout(async () => {
        await post("/twitch-bot/channels/mod", { userId: id });
        setCurrentStep("done");
      }, 1500);
    };

    const redirectToDashboard = async () => {
      setTimeout(async () => {
        console.log("navigating back to dashboard");
        navigate("/dashboard");
      }, 1500);
    };

    const handleStart = async () => {
      setTimeout(async () => {
        setCurrentStep("joining-channel");
      }, 1500);
    };

    switch (currentStep) {
      case "start":
        handleStart();
        break;
      case "joining-channel":
        handleJoinChannel();
        break;
      case "making-mod":
        handleMakeMod();
        break;
      case "done":
        redirectToDashboard();
        break;
      default:
        // Do nothing
        break;
    }
  }, [currentStep]);
  return (
    <main className="mt-10 flex align-middle font-mono">
      <div className="grid-rows-12 m-auto grid max-h-fit w-10/12 max-w-screen-xl grid-cols-6 justify-center p-10">
        <div className="col-span-7 col-start-1 row-start-1 flex justify-between border-b-2">
          <h1 className="m-2 text-4xl sm:m-6 sm:text-5xl lg:m-8 lg:text-6xl">
            modbot
          </h1>

          <h2 className="sm:m-6 lg:m-8">AI-powered Twitch chat moderator</h2>
        </div>

        <div className="col-start-2 col-end-6 row-start-2 pt-6 text-center leading-loose lg:pt-8">
          <p>Connection in progress...</p>
          {LoadingSteps.indexOf(currentStep) <
          LoadingSteps.indexOf("joining-channel") ? null : (
            <p>Joining your Twitch channel...</p>
          )}
          {LoadingSteps.indexOf(currentStep) <
          LoadingSteps.indexOf("making-mod") ? null : (
            <p>Granting modbot mod privileges...</p>
          )}
          {LoadingSteps.indexOf(currentStep) <
          LoadingSteps.indexOf("done") ? null : (
            <p className="underline">success</p>
          )}
        </div>
      </div>
    </main>
  );
}
