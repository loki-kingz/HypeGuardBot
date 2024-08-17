declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string | undefined;
      BOT_USERNAME: string | undefined;
      NODE_ENV: "development" | "production";
      ENCRYPTION_KEY: string | undefined;
      FIREBASE_KEY: string | undefined;
    }
  }
}

export {};
