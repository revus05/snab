import { Bot } from "grammy";

let bot: Bot | null = null;

function getBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return null;
  }
  if (!bot) {
    bot = new Bot(token);
  }
  return bot;
}

type SendTelegramMessageOptions = {
  parseMode?: "HTML" | "MarkdownV2";
};

export async function sendTelegramMessage(
  message: string,
  options?: SendTelegramMessageOptions,
) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const telegramBot = getBot();

  if (!chatId || !telegramBot) {
    return;
  }

  try {
    await telegramBot.api.sendMessage(chatId, message, {
      parse_mode: options?.parseMode,
    });
  } catch (error) {
    console.error("Telegram notification failed:", error);
  }
}

export async function sendRestockTelegramMessage(message: string) {
  await sendTelegramMessage(message);
}
