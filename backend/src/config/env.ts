import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 8080),
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017/ai-humanizer",
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  appUrl: process.env.APP_URL ?? "http://localhost:3000"
};
