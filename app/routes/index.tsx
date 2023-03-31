import type { V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useState } from "react";

export const meta: V2_MetaFunction = () => [
  { title: "Modbot - AI-powered Twitch Moderator" },
];

const Demo = () => {
  const [msgBox, setMsgBox] = useState<string[]>([]);
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-1 flex-row">
      <div className="w-1/2">
        <div className="mt-4 border p-4">
          {msgBox.map((msg) => (
            <div>you: {msg}</div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Try typing something..."
          className="mb-4 w-full border p-4"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setMsgBox([...msgBox, value]);
              setValue("");
            }
          }}
        ></input>
      </div>
      <div className="w-1/2">Results</div>
    </div>
  );
};

export default function Index() {
  return (
    <main className="relative min-h-screen bg-white lg:flex lg:items-center lg:justify-center">
      <div className="relative min-w-full font-mono sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl border-b-2 sm:px-6 lg:px-8">
          <div className="flex flex-col">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl">modbot</h1>
              </div>
              <div>
                <h2>AI-powered Twitch chat moderator</h2>
              </div>
            </div>
            <div className="flex justify-start">
              <Link
                to="/join"
                className="flex items-center justify-center rounded-md border border-transparent bg-sky-300 px-4 py-3 text-base font-medium shadow-sm sm:px-8"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-end">
            <Demo />
            <div className="max-w-sm border-l-2">
              <p>
                modbot uses AI sentiment analysis to remove offensive messages
                that are hateful, violent, sexual, or promote self-harm.
              </p>
              <Link to="/join">
                <u>Connect</u> your Twitch channel to set up modbot in minutes.
              </Link>
            </div>
          </div>
        </div>

        {/* <div className="mx-auto max-w-7xl py-2 px-4 sm:px-6 lg:px-8">
          <div className="mt-6 flex flex-wrap justify-center gap-8">
            {[
              {
                src: "https://user-images.githubusercontent.com/1500684/157764397-ccd8ea10-b8aa-4772-a99b-35de937319e1.svg",
                alt: "Fly.io",
                href: "https://fly.io",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/158238105-e7279a0c-1640-40db-86b0-3d3a10aab824.svg",
                alt: "PostgreSQL",
                href: "https://www.postgresql.org/",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157764484-ad64a21a-d7fb-47e3-8669-ec046da20c1f.svg",
                alt: "Prisma",
                href: "https://prisma.io",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157764276-a516a239-e377-4a20-b44a-0ac7b65c8c14.svg",
                alt: "Tailwind",
                href: "https://tailwindcss.com",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157764454-48ac8c71-a2a9-4b5e-b19c-edef8b8953d6.svg",
                alt: "Cypress",
                href: "https://www.cypress.io",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772386-75444196-0604-4340-af28-53b236faa182.svg",
                alt: "MSW",
                href: "https://mswjs.io",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772447-00fccdce-9d12-46a3-8bb4-fac612cdc949.svg",
                alt: "Vitest",
                href: "https://vitest.dev",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772662-92b0dd3a-453f-4d18-b8be-9fa6efde52cf.png",
                alt: "Testing Library",
                href: "https://testing-library.com",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772934-ce0a943d-e9d0-40f8-97f3-f464c0811643.svg",
                alt: "Prettier",
                href: "https://prettier.io",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157772990-3968ff7c-b551-4c55-a25c-046a32709a8e.svg",
                alt: "ESLint",
                href: "https://eslint.org",
              },
              {
                src: "https://user-images.githubusercontent.com/1500684/157773063-20a0ed64-b9f8-4e0b-9d1e-0b65a3d4a6db.svg",
                alt: "TypeScript",
                href: "https://typescriptlang.org",
              },
            ].map((img) => (
              <a
                key={img.href}
                href={img.href}
                className="flex h-16 w-32 justify-center p-1 grayscale transition hover:grayscale-0 focus:grayscale-0"
              >
                <img alt={img.alt} src={img.src} className="object-contain" />
              </a>
            ))}
          </div>
        </div> */}
      </div>
    </main>
  );
}
