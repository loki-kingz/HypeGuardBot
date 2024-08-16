import { CommandContext, Context, Keyboard } from "grammy";

export async function setUpBot(ctx: CommandContext<Context>) {
  // const addChannelLink = `https://t.me/${PORTAL_BOT_USERNAME || ""}?startchannel=true`; // prettier-ignore

  // const keyboard = new InlineKeyboard().url(`Add ${BOT_USERNAME} to channel`, addChannelLink)
  const text = "❔ Select the group for which the portal will be created.";
  const keyboard = new Keyboard()
    .requestChat(text, 7, {
      chat_is_channel: true,
      user_administrator_rights: {
        is_anonymous: false,
        can_manage_chat: true,
        can_delete_messages: true,
        can_manage_video_chats: false,
        can_restrict_members: false,
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
        can_change_info: true,
        can_delete_messages: true,
        can_restrict_members: true,
        can_invite_users: true,
        can_pin_messages: true,
        can_manage_chat: true,
        can_promote_members: true,
        is_anonymous: false,
        can_manage_video_chats: false,
        can_post_stories: false,
        can_edit_stories: false,
        can_delete_stories: false,
        can_post_messages: true,
      },
    })
    .resized()
    .oneTime();

  ctx.reply(text, { reply_markup: keyboard });
}
