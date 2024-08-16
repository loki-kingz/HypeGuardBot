import { InlineKeyboard } from "grammy";
import { BOT_USERNAME } from "./env";

export const firebaseCollectionPrefix = "_ra_solana_bot";
export const defaultMedia =
  "AgACAgUAAxkBAAMbZr7CDi0vFgacwxC5Bk2Sj6SbvuEAAlG9MRs12_hVlD7MND1SqfoBAAMCAAN5AAM1BA";

export const defaultText = `The group is protected by @${BOT_USERNAME}.

Click below to start human verification.`;

export const verificationLink = "https://google.com";
export const verificationKeyboard = new InlineKeyboard().url(
  "Tap to verify",
  verificationLink
);
