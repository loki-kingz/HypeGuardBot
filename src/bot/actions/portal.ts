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
  buttonStateData,
  portalDataInput,
  updatePortalDataInput,
  userState,
  verifyButtonStateData,
} from "@/vars/state";
import {
  CallbackQueryContext,
  CommandContext,
  Context,
  InlineKeyboard,
  Keyboard,
} from "grammy";

export async function setGroup(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.from.id;
  const portalChannelId = ctx.update.message?.chat_shared?.chat_id;

  if (!portalChannelId)
    return ctx.reply(
      "Couldn't find the portal channel ID, please do /start again"
    );

  updatePortalDataInput(chatId, "media", defaultMedia);
  updatePortalDataInput(chatId, "text", defaultText);
  updatePortalDataInput(chatId, "channelId", portalChannelId);

  const text = "❔ Click below and select the group to create the portal for.";

  const keyboard = new Keyboard()
    .requestChat(text, 8, {
      chat_is_channel: false,
      user_administrator_rights: {
        is_anonymous: false,
        can_manage_chat: true,
        can_delete_messages: true,
        can_manage_video_chats: false,
        can_restrict_members: true,
        can_promote_members: true,
        can_change_info: true,
        can_invite_users: true,
        can_post_stories: false,
        can_edit_stories: false,
        can_delete_stories: false,
        can_pin_messages: true,
        can_post_messages: true,
      },
      bot_administrator_rights: {
        can_manage_chat: true,
        can_post_messages: true,
        is_anonymous: false,
        can_delete_messages: true,
        can_manage_video_chats: false,
        can_restrict_members: true,
        can_promote_members: true,
        can_change_info: true,
        can_invite_users: true,
        can_post_stories: false,
        can_edit_stories: false,
        can_delete_stories: false,
      },
    })
    .resized()
    .oneTime();

  ctx.reply(text, { reply_markup: keyboard });
  // userState[chatId] = "setGroupLink";

  // ctx.reply(text);
}

export async function setGroupLink(ctx: CallbackQueryContext<Context>) {
  const chatId = ctx.from.id;
  const groupId = ctx.update.message?.chat_shared?.chat_id;

  if (!portalDataInput[chatId]) return ctx.reply("Please do /start");

  if (!groupId)
    return ctx.reply("Couldn't find the group ID, please do /start again");

  const { invite_link } = await teleBot.api.createChatInviteLink(groupId);
  if (!invite_link)
    return ctx.reply(
      "Bot couldn't make an invite link for the group. Please try again."
    );

  if (!isValidInviteLink(invite_link)) {
    return ctx.reply("Please enter a valid URL");
  }

  delete userState[chatId];
  updatePortalDataInput(chatId, "link", invite_link);
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
    reply_markup: verificationKeyboard(chatId, portalData.channelId),
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

  delete portalDataInput[chatId];
  delete buttonStateData[chatId];
  delete verifyButtonStateData[chatId];

  teleBot.api.sendPhoto(channelId, media, {
    caption: text,
    reply_markup: verificationKeyboard(chatId, channelId),
  });

  syncPortalsData();
}
