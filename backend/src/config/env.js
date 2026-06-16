import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "Database URL is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "Access secret is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "Refresh secret is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "Google Client ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "Google Client Secret is required"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;
