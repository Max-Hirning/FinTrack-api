import "dotenv/config";

type EnvironmentVariables = {
  HOST: string;
  PORT: number;
  EMAIL: string;
  DB_PORT: number;
  API_URL: string;
  REDIS_URL: string;
  EMAIL_PASS: string;
  DATABASE_URL: string;
  RABBITMQ_URL: string;
  DOCS_PASSWORD: string;
  RABBITMQ_PORT: string;
  CURRENCY_API_KEY: string;
  ACCESS_TOKEN_EXP: string;
  REFRESH_TOKEN_EXP: string;
  CLOUDINARY_API_KEY: string;
  APPLICATION_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_SECRET: string;
  INSTANCE_CONNECTION_NAME: string;
  NODE_ENV: "development" | "production" | "test";
};
const environmentVariables: EnvironmentVariables = {
    EMAIL: process.env.EMAIL || "",
    API_URL: process.env.API_URL || "",
    HOST: process.env.HOST || "0.0.0.0",
    REDIS_URL: process.env.REDIS_URL || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
    RABBITMQ_URL: process.env.RABBITMQ_URL || "",
    DATABASE_URL: process.env.DATABASE_URL || "",
    RABBITMQ_PORT: process.env.RABBITMQ_PORT || "",
    APPLICATION_SECRET: process.env.APPLICATION_SECRET!,
    ACCESS_TOKEN_EXP: process.env.ACCESS_TOKEN_EXP || "",
    CURRENCY_API_KEY: process.env.CURRENCY_API_KEY || "",
    DOCS_PASSWORD: process.env.DOCS_PASSWORD || "password",
    REFRESH_TOKEN_EXP: process.env.REFRESH_TOKEN_EXP || "",
    PORT: process.env.PORT ? Number(process.env.PORT) : 3001,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
    DB_PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    NODE_ENV: process.env.NODE_ENV as EnvironmentVariables["NODE_ENV"],
    INSTANCE_CONNECTION_NAME: process.env.INSTANCE_CONNECTION_NAME || "",
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
