import {
  ButtonData,
  buttonStateData,
  messagesToDelete,
  portalDataInput,
  userState,
  verifyButtonStateData,
} from "@/vars/state";
import {
  CallbackQueryContext,
  CommandContext,
  Context,
  InlineKeyboard,
} from "grammy";

export async function addButtons(
  ctx: CallbackQueryContext<Context> | CommandContext<Context>
) {
  const chatId = ctx.from?.id || ctx.chatId;

  if (!chatId) return ctx.reply("Please click on Add Buttons again");

  const userButtonsData = buttonStateData[chatId] || [];
  const verifyButtonText = verifyButtonStateData[chatId];

  let keyboard = new InlineKeyboard()
    .text(verifyButtonText || "Tap to Verify", "editVerifyButton")
    .row();

  for (const [index, buttonData] of userButtonsData.entries()) {
    const { link, text } = buttonData;
    keyboard = keyboard
      .url(text, link)
      .text("🔴 Delete button", `deleteButton-${index}`)
      .row();
  }

  keyboard = keyboard
    .row()
    .text("➕ Add button", "addButton")
    .text("💾 Save", "saveButtons");

  const message = await ctx.reply(
    '❔ Select the buttons settings and click "Save":',
    {
      reply_markup: keyboard,
    }
  );
  messagesToDelete[chatId] = [message.message_id];
}

export async function addButton(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.from.id;
  const text = `➕ Add Button
    
In the next message reply with the following syntax:
                    
\`Button Name\`
\`Button Link\``;

  userState[chatId] = "getButtonData";
  const message = await ctx.reply(text, { parse_mode: "MarkdownV2" });
  messagesToDelete[chatId]?.push(message.message_id);
}

export async function getButtonData(ctx: CommandContext<Context>) {
  const chatId = ctx.chatId;
  const text = ctx.message?.text;

  if (!text) return ctx.reply("Please enter a valid input");

  const [buttonText, buttonLink] = text.split("\n");

  if (!buttonText)
    return ctx.reply(
      "Couldn't identify the button text, please enter in the correct syntax"
    );
  if (!buttonLink)
    return ctx.reply(
      "Couldn't identify the button link, please enter in the correct syntax"
    );
  if (!buttonLink.startsWith("https"))
    return ctx.reply("The passed link isn't valid, please try again");

  ctx.deleteMessage();
  ctx.deleteMessages(messagesToDelete[chatId]);
  delete userState[chatId];
  delete messagesToDelete[chatId];

  const userButtonStateData = buttonStateData[chatId];
  if (!userButtonStateData) buttonStateData[chatId] = [];
  const userButtonsData: ButtonData = { text: buttonText, link: buttonLink };
  buttonStateData[chatId].push(userButtonsData);

  addButtons(ctx);
}

export async function deleteButton(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.from.id;
  const index = Number(ctx.callbackQuery.data.split("-").at(-1));
  buttonStateData[chatId].splice(index, 1);
  ctx.deleteMessage();
  addButtons(ctx);
}

export async function editVerifyButton(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.from.id;
  const text = `The verification button is currently titled \`Tap To Verify\`\\.
    
You can change the title by entering a new title below\\.`;

  const keyboard = new InlineKeyboard().text("🔙 Back", "addButtons");
  userState[chatId] = "changeVerifyButtonTitle";

  ctx.reply(text, { parse_mode: "MarkdownV2", reply_markup: keyboard });
}

export async function changeVerifyButtonTitle(ctx: CommandContext<Context>) {
  const chatId = ctx.chatId;
  const text = ctx.message?.text;

  if (!text) return ctx.reply("Please enter a valid title");

  verifyButtonStateData[chatId] = text;

  delete userState[chatId];
  addButtons(ctx);
}

export async function saveButtons(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.from.id;
  const verifyText = verifyButtonStateData[chatId];
  const buttonsData = buttonStateData[chatId];

  portalDataInput[chatId] = {
    ...portalDataInput[chatId],
    buttonData: { verifyButton: verifyText, customButtons: buttonsData },
  };

  const text = `❔ Select the settings and click "Create Portal":`;

  const keyboard = new InlineKeyboard()
    .text("🖼️ Set Media", "setMediaInput")
    .text("View current media", "viewMedia")
    .row()
    .text("📝 Set Text", "setTextInput")
    .text("View current text", "viewText")
    .row()
    .text("⚫ Buttons", "addButtons")
    .row()
    .text("🔍 Preview Portal", "previewPortal")
    .row()
    .text("✅ Create Portal", "createPortal");

  ctx.reply(text, { reply_markup: keyboard });
}
