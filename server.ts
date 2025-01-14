import path from "path";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";
import prom from "@isaacs/express-prometheus-middleware";
import {
  apiClient,
  authProvider,
  chatClient,
  init,
} from "~/services/twitch.server";
import {
  getModbotTwitchIntegration,
  getTwitchIntegrationForUserId,
  getTwitchTokensForUserId,
} from "~/models/twitch.server";

const modbotId = process.env.MODBOT_USER_ID;

// Trusted domains
// @TODO @PROD
const allowedOrigins = ["http://localhost:3000"];

const app = express();
const metricsApp = express();
app.use(
  prom({
    metricsPath: "/metrics",
    collectDefaultMetrics: true,
    metricsApp,
  })
);

// Enable CORS and allow requests only from trusted domains
// app.use(
//   cors({
//     origin: "http://localhost:3000", // Replace with your domain
//     optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
//   })
// );

app.use((req, res, next) => {
  // helpful headers:
  res.set("x-fly-region", process.env.FLY_REGION ?? "unknown");
  res.set("Strict-Transport-Security", `max-age=${60 * 60 * 24 * 365 * 100}`);

  // /clean-urls/ -> /clean-urls
  if (req.path.endsWith("/") && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    const safepath = req.path.slice(0, -1).replace(/\/+/g, "/");
    res.redirect(301, safepath + query);
    return;
  }
  next();
});

app.use("/twitch-bot/*", express.json());

// Route /twitch-bot/ away from remix
app.all("/twitch-bot/channels", (req, res) => {
  res.json({ currentChannels: chatClient.currentChannels });
});

app.all("/twitch-bot/channels/join", async (req, res) => {
  const channelName = req.body.channel;
  console.log(`joining ${channelName}`);
  await chatClient.join(channelName);
  res.json({ currentChannels: chatClient.currentChannels });
});

app.all("/twitch-bot/channels/mod", async (req, res) => {
  const userId = req.body.userId;
  const twitchIntegration = await getTwitchIntegrationForUserId(userId);
  const modbotIntegration = await getModbotTwitchIntegration();
  // if we came frome /onboarding, we might have a weird bug where authProvider doesn't
  // have the user. so we readd the user here just in case.
  const twitchAccessTokens = await getTwitchTokensForUserId(userId);
  // @TODO: @ERROR if no access tokens
  authProvider.addUser(twitchIntegration.id, {
    ...twitchAccessTokens,
    obtainmentTimestamp: Number(twitchAccessTokens.obtainmentTimestamp),
  });

  try {
    await apiClient.moderation.addModerator(
      twitchIntegration.id,
      modbotIntegration.id
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    //@ts-ignore
    const message = JSON.parse(e?.body).message;
    if (message === "user is already a mod") {
      res.json({
        ok: true,
      });
      return;
    }

    res.json({
      ok: false,
      error: message,
    });
  }
});

app.get("/twitch-bot/onboarded", async (req, res) => {
  const userId = req.query.userId as string;
  const twitchIntegration = await getTwitchIntegrationForUserId(userId);

  // just check if we are in the channel to see if we are onboarded.
  const isOnboarded = chatClient.currentChannels.includes(
    `#${twitchIntegration.twitchChannelName}`
  );

  res.json({
    ok: true,
    isOnboarded,
  });
});

// if we're not in the primary region, then we need to make sure all
// non-GET/HEAD/OPTIONS requests hit the primary region rather than read-only
// Postgres DBs.
// learn more: https://fly.io/docs/getting-started/multi-region-databases/#replay-the-request
app.all("*", function getReplayResponse(req, res, next) {
  const { method, path: pathname } = req;
  const { PRIMARY_REGION, FLY_REGION } = process.env;

  const isMethodReplayable = !["GET", "OPTIONS", "HEAD"].includes(method);
  const isReadOnlyRegion =
    FLY_REGION && PRIMARY_REGION && FLY_REGION !== PRIMARY_REGION;

  const shouldReplay = isMethodReplayable && isReadOnlyRegion;

  if (!shouldReplay) return next();

  const logInfo = {
    pathname,
    method,
    PRIMARY_REGION,
    FLY_REGION,
  };
  console.info(`Replaying:`, logInfo);
  res.set("fly-replay", `region=${PRIMARY_REGION}`);
  return res.sendStatus(409);
});

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

const MODE = process.env.NODE_ENV;
const BUILD_DIR = path.join(process.cwd(), "build");

app.all(
  "*",
  MODE === "production"
    ? createRequestHandler({ build: require(BUILD_DIR) })
    : (...args) => {
        purgeRequireCache();
        const requestHandler = createRequestHandler({
          build: require(BUILD_DIR),
          mode: MODE,
        });
        return requestHandler(...args);
      }
);

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  // require the built app so we're ready when the first request comes in
  require(BUILD_DIR);
  console.log(`✅ app ready: http://localhost:${port}`);

  await init();
});

const metricsPort = process.env.METRICS_PORT || 3001;

metricsApp.listen(metricsPort, () => {
  console.log(`✅ metrics ready: http://localhost:${metricsPort}/metrics`);
});

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, we prefer the DX of this though, so we've included it
  // for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete require.cache[key];
    }
  }
}
