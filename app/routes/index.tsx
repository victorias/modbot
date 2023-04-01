import { json, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { Form, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { moderate } from "~/bot/mod/openai.server";

export const meta: V2_MetaFunction = () => [
  { title: "Modbot - AI-powered Twitch Moderator" },
];

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const message = url.searchParams.get("message") || "";

  const moderation = await moderate(message);
  return json(moderation);
}

const Demo = () => {
  const [msgBox, setMsgBox] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const moderation = useFetcher();
  return (
    <div className="flex flex-1 flex-row">
      <div className="w-1/2">
        <div className="mt-4 border p-4">
          {msgBox.map((msg) => (
            <div>
              <b>you:</b> {msg}
            </div>
          ))}
        </div>
        <Form method="get">
          <input
            type="text"
            placeholder="Try typing something..."
            className="mb-4 w-full border p-4"
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
      <div className="w-1/2 flex-col">
        <h3>Results</h3>
        <ul>
          <li>hate: {moderation.data?.categories.hate ? "true" : "false"}</li>
          <li>
            self harm: {moderation.data?.categories.selfHarm ? "true" : "false"}
          </li>
          <li>
            violence: {moderation.data?.categories.violence ? "true" : "false"}
          </li>
          <li>
            sexual: {moderation.data?.categories.sexual ? "true" : "false"}
          </li>
          <li>Flagged: {moderation.data?.flagged ? "true" : "false"}</li>
        </ul>
      </div>
    </div>
  );
};

export default function IndexPage() {
  const [msgBox, setMsgBox] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const moderation = useFetcher();

  // just store the index of msgs that have been flagged for UI purposes
  const [flaggedMsgs, setFlaggedMsgs] = useState(new Set());

  console.log(moderation);
  useEffect(() => {
    if (moderation.type === "done" && moderation.data.flagged) {
      setFlaggedMsgs(flaggedMsgs.add(msgBox[msgBox.length - 1]));
    }
  }, [moderation]);

  return (
    <main className="mt-10 flex align-middle font-mono">
      <div className="m-auto grid min-w-min max-w-screen-xl grid-cols-index grid-rows-index justify-center">
        <div className="col-start-1 row-start-1">
          <h1 className="text-4xl sm:m-6 sm:text-5xl lg:m-8 lg:text-6xl ">
            modbot
          </h1>
        </div>
        <div className="col-start-1 row-start-2 border-b-2">
          <Form action="/auth/twitch" method="post">
            <button className="flex items-center justify-center bg-sky-300  px-4 py-3 text-base font-medium shadow-sm sm:mx-6 sm:mb-6 sm:px-8 lg:mx-8 lg:mb-8">
              Sign up
            </button>
          </Form>
        </div>
        <div className="row-1 col-span-3 col-start-4 row-span-1 flex items-end justify-end sm:m-6 lg:m-8">
          <h2>AI-powered Twitch chat moderator</h2>
        </div>
        <div className="col-start-1 col-end-7 row-start-3 h-10"></div>
        <div className="col-start-1 col-end-3 row-start-4 row-end-5 h-96  border p-4 sm:w-full lg:w-[32rem]">
          {msgBox.map((msg, idx) => (
            <div
              key={idx}
              className={flaggedMsgs.has(msg) ? "text-red-500" : ""}
            >
              <b>you:</b> {msg}
            </div>
          ))}
        </div>
        <div className="col-start-1 col-end-3 row-start-5 sm:w-full lg:w-[32rem]">
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
        <div className="col-start-4 row-start-4 row-end-6 leading-10 sm:m-8 lg:m-8 lg:w-[20rem]">
          <h3>Results:</h3>
          <ul>
            <li>
              Hateful ...{" "}
              {moderation.type === "init"
                ? ""
                : moderation.data?.categories.hate
                ? "Fail"
                : "Pass"}
            </li>
            <li>
              Violent ...{" "}
              {moderation.type === "init"
                ? ""
                : moderation.data?.categories.violence
                ? "Fail"
                : "Pass"}
            </li>
            <li>
              Sexual ...{" "}
              {moderation.type === "init"
                ? ""
                : moderation.data?.categories.sexual
                ? "Fail"
                : "Pass"}
            </li>
            <li>
              Self-harm ...{" "}
              {moderation.type === "init"
                ? ""
                : moderation.data?.categories.selfHarm
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
        <div className="col-start-6 row-start-4 row-end-5 max-w-xs sm:p-6 lg:p-8">
          <p className="mb-10">
            modbot uses AI sentiment analysis to remove offensive messages that
            are hateful, violent, sexual, or promote self-harm.
          </p>
          <Form action="/auth/twitch" method="post">
            <button className="inline underline">Connect</button> your Twitch
            channel to set up modbot in minutes.
          </Form>
        </div>

        <div className="col-start-6 row-start-3 row-end-6 border-l-2"></div>

        <div className="col-start-2 col-end-7 row-start-2 border-b-2"></div>
      </div>
    </main>
  );
}
