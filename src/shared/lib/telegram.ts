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

export async function sendRestockTelegramMessage(message: string) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const telegramBot = getBot();

  if (!chatId || !telegramBot) {
    return;
  }

  try {
    await telegramBot.api.sendMessage(chatId, message);
  } catch (error) {
    console.error("Telegram notification failed:", error);
  }
}
