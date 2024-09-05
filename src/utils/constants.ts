import { InlineKeyboard } from "grammy";
import { BOT_USERNAME } from "./env";
import { portalDataInput } from "@/vars/state";

export const firebaseCollectionPrefix = "_ra_solana_bot";
export const defaultMedia =
  "AgACAgUAAxkBAAMbZr7CDi0vFgacwxC5Bk2Sj6SbvuEAAlG9MRs12_hVlD7MND1SqfoBAAMCAAN5AAM1BA";

export const defaultText = `The group is protected by @${BOT_USERNAME}.

Click below to start human verification.`;

export const verificationLink = "https://hype-guard-web-app.vercel.app?param=";

export const verificationKeyboard = (chatId: number, channelId: number) => {
  const { buttonData } = portalDataInput[chatId];
  const verifyText = buttonData?.verifyButton;
  const buttons = buttonData?.customButtons;

  let keyboard = new InlineKeyboard()
    .url(
      verifyText || "Tap to verify",
      `https://t.me/${BOT_USERNAME}?start=${channelId}`
    )
    .row();

  for (const [index, button] of (buttons || []).entries()) {
    const { link, text } = button;
    keyboard = keyboard.url(text, link);

    if (index % 2 === 1) keyboard = keyboard.row();
  }

  return keyboard;
};
