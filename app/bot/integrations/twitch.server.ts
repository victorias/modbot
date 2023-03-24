import tmi from "tmi.js";
import dotenv from "dotenv";

dotenv.config();

const options = {
  identity: {
    username: "modbotapp",
    password: process.env.TWITCH_OAUTH_TOKEN,
  },
  channels: [],
};
