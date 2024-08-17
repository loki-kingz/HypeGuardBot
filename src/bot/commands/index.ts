import { teleBot } from "@/index";
import { startBot } from "./start";
import { errorHandler, log } from "@/utils/handlers";
import { executeStep } from "../executeStep";
import { CommandContext, Context } from "grammy";
import { error } from "console";

export function initiateBotCommands() {
  teleBot.api
    .setMyCommands([{ command: "start", description: "Start the bot" }])
    .catch(() => errorHandler(error));

  teleBot.command("start", (ctx) => startBot(ctx));

  teleBot.on(["message"], (ctx) => {
    executeStep(ctx as CommandContext<Context>);
  });

  log("Bot commands up");
}
