import { InlineKeyboard } from "grammy";
import { BOT_USERNAME } from "./env";

export const firebaseCollectionPrefix = "_ra_solana_bot";
export const defaultMedia =
  "AgACAgUAAxkBAAMbZr7CDi0vFgacwxC5Bk2Sj6SbvuEAAlG9MRs12_hVlD7MND1SqfoBAAMCAAN5AAM1BA";

export const defaultText = `The group is protected by @${BOT_USERNAME}.

Click below to start human verification.`;

export const verificationLink =
  "https://hype-guard-web-app.vercel.app?channelId=-1002202275068";
export const verificationKeyboard = (channelId: number) =>
  new InlineKeyboard().webApp(
    "Tap to verify",
    `${verificationLink}?channelId=${channelId}`
  );
