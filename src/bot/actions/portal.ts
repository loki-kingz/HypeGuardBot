import { addDocument, getDocument, updateDocumentById } from "@/firebase";
import { teleBot } from "@/index";
import { StoredPortalData } from "@/types/portalData";
import {
  defaultMedia,
  defaultText,
  verificationKeyboard,
} from "@/utils/constants";
import { isValidInviteLink } from "@/utils/general";
import { syncPortalsData } from "@/vars/portalsData";
import {
  portalDataInput,
  updatePortalDataInput,
  userState,
} from "@/vars/state";
import {
  CallbackQueryContext,
  CommandContext,
  Context,
  InlineKeyboard,
} from "grammy";

export async function inputGroupLink(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.from.id;
  const portalChannelId = ctx.update.message?.chat_shared?.chat_id;

  if (!portalChannelId)
    return ctx.reply(
      "Couldn't find the portal channel ID, please do /start again"
    );

  updatePortalDataInput(chatId, "media", defaultMedia);
  updatePortalDataInput(chatId, "text", defaultText);
  updatePortalDataInput(chatId, "channelId", portalChannelId);

  const text = "❔ Send me original group's link.";
  userState[chatId] = "setGroupLink";

  ctx.reply(text);
}

export async function setGroupLink(ctx: CommandContext<Context>) {
  const chatId = ctx.chat.id;
  const inviteLink = ctx.message?.text;

  if (!inviteLink) return;

  if (!isValidInviteLink(inviteLink)) {
    return ctx.reply("Please enter a valid URL");
  }

  delete userState[chatId];
  updatePortalDataInput(chatId, "link", inviteLink);
  const text = `❔ Select the settings and click "Create Portal":`;

  const keyboard = new InlineKeyboard()
    .text("🖼️ Set Media", "setMediaInput")
    .text("View current media", "viewMedia")
    .row()
    .text("📝 Set Text", "setTextInput")
    .text("View current text", "viewText")
    .row()
    .text("🔍 Preview Portal", "previewPortal")
    .row()
    .text("✅ Create Portal", "createPortal");

  ctx.reply(text, { reply_markup: keyboard });
}

export async function setMediaInput(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.from.id;
  userState[chatId] = "setMedia";
  const text = "❔ Send me the new media to set for portal message.";
  ctx.reply(text);
}

export async function setMedia(ctx: CommandContext<Context>) {
  const chatId = ctx.chat.id;
  const media = ctx.message?.photo?.at(-1)?.file_id;

  if (!media) return ctx.reply("Invalid photo, please try again.");

  delete userState[chatId];
  updatePortalDataInput(chatId, "media", media);

  ctx.reply("✅ Photo set as portal media.");
}

export async function viewMedia(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.from.id;
  const media = portalDataInput[chatId]?.media;

  if (!media)
    return ctx.reply(
      "There was an error in getting the set media. Please do /start again."
    );

  ctx.replyWithPhoto(media);
}

export async function setTextInput(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.from.id;
  userState[chatId] = "setText";
  const text = "❔ Send me the new text to set for portal message.";
  ctx.reply(text);
}

export async function setText(ctx: CommandContext<Context>) {
  const chatId = ctx.chat.id;
  const text = ctx.message?.text;

  if (!text) return ctx.reply("Invalid text, please try again.");

  delete userState[chatId];
  updatePortalDataInput(chatId, "text", text);

  ctx.reply("✅ Text set as portal text.");
}

export async function viewText(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.from.id;
  const text = portalDataInput[chatId]?.text;

  if (!text)
    return ctx.reply(
      "There was an error in getting the set text. Please do /start again."
    );

  ctx.reply(text);
}

export async function previewPortal(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.from.id;
  const portalData = portalDataInput[chatId];

  if (!portalData) return ctx.reply("Please do /start again.");

  const { media, text } = portalData;
  if (!media || !text)
    return ctx.reply(
      "Either your media or text isn't set correctly. Please try again."
    );

  ctx.replyWithPhoto(media, {
    caption: text,
    reply_markup: verificationKeyboard(portalData.channelId),
  });
}

export async function createPortal(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.from.id;
  const portalData = portalDataInput[chatId];

  if (!portalData) return ctx.reply("Please do /start again.");
  const { channelId, text, media } = portalData;

  const channelAlreadyStored = (
    await getDocument<StoredPortalData>({
      collectionName: "portal_data",
      queries: [["channelId", "==", channelId]],
    })
  ).at(0);

  if (channelAlreadyStored) {
    await updateDocumentById<StoredPortalData>({
      collectionName: "portal_data",
      id: channelAlreadyStored.id || "",
      updates: portalData,
    });
  } else {
    await addDocument<StoredPortalData>({
      collectionName: "portal_data",
      data: portalData,
    });
  }

  ctx.reply("✅ Portal created successfully!!");

  teleBot.api.sendPhoto(channelId, media, {
    caption: text,
    reply_markup: verificationKeyboard(channelId),
  });

  syncPortalsData();
}
