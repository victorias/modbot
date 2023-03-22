import dotenv from "dotenv";
import { OpenAIApi, Configuration } from "openai";

dotenv.config();

const config = {
  apiKey: process.env.OPENAI_API_KEY,
};

const client = new OpenAIApi(new Configuration(config));

export default client;

export async function moderate(input) {
  const moderation = await client.createModeration({ input });
  return moderation.data.results[0].flagged;
}
