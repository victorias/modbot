import { ActionArgs, json, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { moderate } from "~/bot/mod/openai.server";
import { authenticator } from "~/services/auth.server";

export const meta: V2_MetaFunction = () => [
  { title: "Modbot - AI-powered Twitch Moderator" },
];

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const message = url.searchParams.get("message") || "";

  let moderation;
  if (message) {
    moderation = await moderate(message);
  }

  const user = await authenticator.isAuthenticated(request);
  return json({
    ...moderation,
    user,
  });
}

export default function IndexPage() {
  const [msgBox, setMsgBox] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const moderation = useFetcher<typeof loader>();
  const { user } = useLoaderData<typeof loader>();
  const messageBoxDiv = useRef<HTMLDivElement>();

  // just store the index of msgs that have been flagged for UI purposes
  const [flaggedMsgs, setFlaggedMsgs] = useState(new Set());

  useEffect(() => {
    if (moderation.type === "done" && moderation.data.flagged) {
      setFlaggedMsgs(flaggedMsgs.add(msgBox[msgBox.length - 1]));
    }
  }, [moderation]);

  return (
    <main className="mt-10 flex align-middle font-mono">
      <div className="grid-rows-12 m-auto grid max-h-fit max-w-screen-xl grid-cols-6 justify-center p-10  lg:w-10/12">
        <div className="col-span-7 col-start-1 row-start-1 flex flex-col justify-between lg:flex-row">
          <h1 className="text-4xl sm:m-6 sm:text-5xl lg:m-8 lg:text-6xl">
            modbot
          </h1>

          <h2 className="sm:m-6 lg:m-8">AI-powered Twitch chat moderator</h2>
        </div>
        <div className="col-span-7 col-start-1 row-start-2 border-b-2 pb-2">
          {!!user ? (
            <a
              href="/dashboard"
              className="flex min-w-fit max-w-sm items-center justify-center bg-sky-300  px-5 py-3 text-base font-medium shadow-sm"
            >
              Dashboard
            </a>
          ) : (
            <Form action="/auth/twitch" method="post">
              <button className="flex min-w-fit max-w-sm items-center justify-center bg-sky-300  px-5 py-3 text-base font-medium shadow-sm">
                Connect to Twitch
              </button>
            </Form>
          )}
        </div>
        <div className="col-start-1 col-end-7 row-start-3 row-end-5 flex flex-col lg:col-end-3">
          <div className="mt-10 flex min-h-[15rem] flex-auto flex-col overflow-scroll border-2 p-3">
            {msgBox.map((msg, idx) => (
              <div
                key={idx}
                className={flaggedMsgs.has(msg) ? "text-red-500" : ""}
              >
                <b>you:</b> {msg}
              </div>
            ))}
          </div>
          <Form method="get">
            <input
              type="text"
              placeholder="Try typing something..."
              className="min-h-40 h-full w-full border p-4"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  setMsgBox([...msgBox, value]);
                  setValue("");
                  moderation.submit({ message: value });
                }
              }}
            ></input>
          </Form>
        </div>

        <div className="col-start-1 col-end-7 row-start-6 row-end-6 mb-10 flex flex-col pt-10 lg:col-start-3 lg:col-end-5 lg:row-start-3 lg:row-end-3 lg:p-10">
          <h3>Results:</h3>
          <ul>
            <li>
              Hateful ...{" "}
              {moderation.type === "init"
                ? ""
                : moderation.data?.categories?.hate
                ? "Fail"
                : "Pass"}
            </li>
            <li>
              Violent ...{" "}
              {moderation.type === "init"
                ? ""
                : moderation.data?.categories?.violence
                ? "Fail"
                : "Pass"}
            </li>
            <li>
              Sexual ...{" "}
              {moderation.type === "init"
                ? ""
                : moderation.data?.categories?.sexual
                ? "Fail"
                : "Pass"}
            </li>
            <li>
              Self-harm ...{" "}
              {moderation.type === "init"
                ? ""
                : moderation.data?.categories?.selfHarm
                ? "Fail"
                : "Pass"}
            </li>

            {moderation.type === "init" ? null : moderation.data?.flagged ? (
              <li>
                <b>Message has been removed</b>
              </li>
            ) : (
              <li>Message has been approved</li>
            )}
          </ul>
        </div>
        <div className="col-span-7 col-start-1 row-start-7 border-t-2 pt-10 lg:col-start-5 lg:col-end-7 lg:row-start-3 lg:row-end-3 lg:border-t-0 lg:border-l-2 lg:p-10">
          <p className="mb-10">
            modbot uses AI sentiment analysis to remove offensive messages that
            are hateful, violent, sexual, or promote self-harm.
          </p>
          <Form action="/auth/twitch" method="post" className="mb-10">
            <button className="inline underline">Connect</button> your Twitch
            channel to set up modbot for free.
          </Form>
          <p>
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
