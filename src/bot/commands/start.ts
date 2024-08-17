import { BOT_USERNAME } from "@/utils/env";
import { CommandContext, Context, InlineKeyboard } from "grammy";
import { setUpBot } from "./setup";
import { verificationLink } from "@/utils/constants";
import { portalsData } from "@/vars/portalsData";

export async function startBot(ctx: CommandContext<Context>) {
  const { match } = ctx;
  const channelId = match ? Number(match) : null;

  if (channelId && !isNaN(channelId)) {
    const portalData = portalsData[channelId];
    if (!portalData) return;

    const { text, media, link } = portalData;
    const keyboard = new InlineKeyboard().webApp(
      "🛡️ Tap to verify",
      `${verificationLink}?${link}`
    );
    return ctx.replyWithPhoto(media, { caption: text, reply_markup: keyboard });
  }

  const text = `Welcome to ${BOT_USERNAME}!!!\n\n`;
  await ctx.reply(text);

  setUpBot(ctx);
}
