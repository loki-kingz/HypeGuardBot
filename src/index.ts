import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import { BOT_TOKEN } from "./utils/env";
import { syncPortalsData } from "./vars/portalsData";

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");

// Check for new transfers at every 20 seconds
const interval = 20;

(async function () {
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  await Promise.all([syncPortalsData()]);

  async function toRepeat() {
    //
    setTimeout(toRepeat, interval * 1e3);
  }
  await toRepeat();
})();
