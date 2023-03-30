import { OpenAIApi, Configuration } from "openai";

const config = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openAiClient = new OpenAIApi(new Configuration(config));

export { openAiClient };

export async function moderate(input: string) {
  const moderation = await openAiClient.createModeration({ input });

  const result = moderation.data.results[0];
  const { categories } = result;
  return {
    flagged: result.flagged,
    categories: {
      hate: categories.hate && categories["hate/threatening"],
      selfHarm: categories["self-harm"],
      sexual: categories.sexual && categories["sexual/minors"],
      violence: categories.violence && categories["violence/graphic"],
    },
  };
}
