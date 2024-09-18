import "dotenv/config";

type EnvironmentVariables = {
  HOST: string;
  PORT: number;
  ACCESS_TOKEN_EXP: string;
  REFRESH_TOKEN_EXP: string;
  DOCS_PASSWORD: string;
  APPLICATION_SECRET: string;
  NODE_ENV: "development" | "production" | "test";
};
const environmentVariables: EnvironmentVariables = {
    HOST: process.env.HOST || "0.0.0.0",
    ACCESS_TOKEN_EXP: process.env.ACCESS_TOKEN_EXP || "",
    REFRESH_TOKEN_EXP: process.env.REFRESH_TOKEN_EXP || "",
    PORT: process.env.PORT ? Number(process.env.PORT) : 3001,
    APPLICATION_SECRET: process.env.APPLICATION_SECRET!,
    NODE_ENV: process.env.NODE_ENV as EnvironmentVariables["NODE_ENV"],
    DOCS_PASSWORD: process.env.DOCS_PASSWORD || "password",
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
