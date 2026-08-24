import dotenv from "dotenv";

const requiredEnv = (name: string): string => {
  dotenv.config();
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

export const env = {
  DB_CONNECTION_STRING: requiredEnv("DB_CONNECTION_STRING"),
};
