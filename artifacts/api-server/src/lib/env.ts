import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().min(1).regex(/^\d+$/, "PORT must be a numeric string"),
  SESSION_SECRET: z
    .string()
    .min(16, "SESSION_SECRET must be at least 16 characters")
    .optional(),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL").optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PAYWAY_MERCHANT_ID: z.string().optional(),
  PAYWAY_API_KEY: z.string().optional(),
  PAYWAY_API_SECRET: z.string().optional(),
  PAYWAY_RETURN_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${issues}`);
  }

  return result.data;
}

export const env = validateEnv();
