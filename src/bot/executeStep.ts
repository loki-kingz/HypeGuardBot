import { CallbackQueryContext, CommandContext, Context } from "grammy";
import { log } from "@/utils/handlers";
import { userState } from "@/vars/state";
import {
  createPortal,
  previewPortal,
  setGroup,
  setGroupLink,
  setMedia,
  setMediaInput,
  setText,
  setTextInput,
  viewMedia,
  viewText,
} from "./actions/portal";
import {
  addButton,
  addButtons,
  changeVerifyButtonTitle,
  deleteButton,
  editVerifyButton,
  getButtonData,
  saveButtons,
} from "./actions/buttons";

const steps: { [key: string]: any } = {
  setGroupLink,

  setMediaInput,
  setMedia,
  viewMedia,

  setTextInput,
  setText,
  viewText,

  previewPortal,
  createPortal,

  addButtons,
  addButton,
  getButtonData,
  deleteButton,
  editVerifyButton,
  changeVerifyButtonTitle,
  saveButtons,
};

const requestIds: { [key: number]: any } = {
  0: () => null,
  7: setGroup,
  8: setGroupLink,
};

export async function executeStep(
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) {
  const request_id = ctx.update.message?.chat_shared?.request_id || 0;
  requestIds[request_id](ctx);

  const chatId = ctx.chat?.id;
  if (!chatId) return ctx.reply("Please redo your action");

  const userStateCategory = userState[chatId]?.split("-").at(0);
  const queryCategory = ctx.callbackQuery?.data?.split("-").at(0);
  const step = userStateCategory || queryCategory || "";
  const stepFunction = steps[step];

  if (stepFunction) {
    stepFunction(ctx);
  } else {
    log(`No step function for ${queryCategory} ${userState[chatId]}`);
  }
}
