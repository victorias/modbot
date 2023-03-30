import { Form, useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/server-runtime";
import { useEffect, useState } from "react";
import { getTwitchIntegrationForUserId } from "~/models/twitch.server";
import { authenticator } from "~/services/auth.server";
import { post } from "~/utils/fetch";

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const twitchIntegration = await getTwitchIntegrationForUserId(user.id);
  return json({
    user,
    twitchIntegration,
  });
}

// We define LoadingSteps as a constant array of strings using the as const assertion to make TypeScript infer the string literal types instead of just string.
const LoadingSteps = ["joining-channel", "making-mod", "done"] as const;
// We define a LoadingStep type that represents a union of all the possible values in the LoadingSteps array. We use the typeof operator to get the type of the LoadingSteps array and then use the number indexed access type to get a union of all its elements.
type LoadingStep = (typeof LoadingSteps)[number];

function isAtOrBeforeTargetStep(
  currentStep: LoadingStep,
  targetStep: LoadingStep
): boolean {
  return LoadingSteps.indexOf(currentStep) <= LoadingSteps.indexOf(targetStep);
}

export default function OnboardingPage() {
  const {
    user: { id },
    twitchIntegration: { twitchChannelName },
  } = useLoaderData<typeof loader>();
  const [currentStep, setCurrentStep] =
    useState<LoadingStep>("joining-channel");

  useEffect(() => {
    const handleJoinChannel = async () => {
      setTimeout(async () => {
        await post("/twitch-bot/channels/join", { channel: twitchChannelName });
        setCurrentStep("making-mod");
      }, 3000); // delay for 3 seconds
    };

    const handleMakeMod = async () => {
      setTimeout(async () => {
        await post("/twitch-bot/channels/mod", { userId: id });
        setCurrentStep("done");
      }, 3000); // delay for 3 seconds
    };

    switch (currentStep) {
      case "joining-channel":
        handleJoinChannel();
        break;
      case "making-mod":
        handleMakeMod();
        break;
      default:
        // Do nothing
        break;
    }
  }, [currentStep]);
  return (
    <main className="flex flex-col">
      <h1>Onboarding</h1>
      <ul>
        <li>
          Joining the channel..........
          {isAtOrBeforeTargetStep(currentStep, "joining-channel")
            ? "JOINING"
            : "DONE"}
        </li>
        <li>
          Making modbot a mod..........
          {isAtOrBeforeTargetStep(currentStep, "making-mod")
            ? "ASKING NICELY"
            : "DONE"}
        </li>
      </ul>
      <Form action="/logout" method="post">
        <button>Logout</button>
      </Form>
    </main>
  );
}
