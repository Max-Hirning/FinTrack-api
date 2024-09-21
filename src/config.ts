import "dotenv/config";

type EnvironmentVariables = {
  HOST: string;
  PORT: number;
  EMAIL: string;
  API_URL: string;
  EMAIL_PASS: string;
  RABBITMQ_URL: string;
  DOCS_PASSWORD: string;
  RABBITMQ_PORT: string;
  CURRENCY_API_KEY: string;
  ACCESS_TOKEN_EXP: string;
  REFRESH_TOKEN_EXP: string;
  APPLICATION_SECRET: string;
  NODE_ENV: "development" | "production" | "test";
};
const environmentVariables: EnvironmentVariables = {
    EMAIL: process.env.EMAIL || "",
    API_URL: process.env.API_URL || "",
    HOST: process.env.HOST || "0.0.0.0",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
    RABBITMQ_URL: process.env.RABBITMQ_URL || "",
    RABBITMQ_PORT: process.env.RABBITMQ_PORT || "",
    APPLICATION_SECRET: process.env.APPLICATION_SECRET!,
    ACCESS_TOKEN_EXP: process.env.ACCESS_TOKEN_EXP || "",
    CURRENCY_API_KEY: process.env.CURRENCY_API_KEY || "",
    DOCS_PASSWORD: process.env.DOCS_PASSWORD || "password",
    REFRESH_TOKEN_EXP: process.env.REFRESH_TOKEN_EXP || "",
    PORT: process.env.PORT ? Number(process.env.PORT) : 3001,
    NODE_ENV: process.env.NODE_ENV as EnvironmentVariables["NODE_ENV"],
};

// Add environment variables that are optional.
const envWhitelist: (keyof EnvironmentVariables)[] = [];

Object.entries(environmentVariables).forEach(([key, value]) => {
    const isWhitelisted = envWhitelist.includes(
    key as keyof EnvironmentVariables,
    );
    if (!value && !isWhitelisted) {
        throw new Error(`Missing environment variable: ${key}`);
    }
});

export { environmentVariables };
export type { EnvironmentVariables };
