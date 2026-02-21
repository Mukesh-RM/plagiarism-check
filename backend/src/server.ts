import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { Queue } from "bullmq";
import Redis from "ioredis";
import { env } from "./config/env.js";
import { authRouter } from "./routes/authRoutes.js";
import { analysisRouter } from "./routes/analysisRoutes.js";
import { reportRouter } from "./routes/reportRoutes.js";
import { billingRouter } from "./routes/billingRoutes.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: env.appUrl, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/analysis", analysisRouter);
app.use("/api/reports", reportRouter);
app.use("/api/billing", billingRouter);

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  return res.status(400).json({ message: error.message || "Unknown error" });
});

const start = async () => {
  await mongoose.connect(env.mongoUri);

  const redis = new Redis(env.redisUrl, { maxRetriesPerRequest: null });
  new Queue("humanize-jobs", { connection: redis });

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend on http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
