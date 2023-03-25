import { OpenAIApi, Configuration } from "openai";

const config = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openAiClient = new OpenAIApi(new Configuration(config));

export { openAiClient };

export async function moderate(input: string) {
  const moderation = await openAiClient.createModeration({ input });
  return moderation.data.results[0].flagged;
}
