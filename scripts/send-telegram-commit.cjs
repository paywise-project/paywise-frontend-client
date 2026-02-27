const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../.env.local"),
});

const commitMsgFile = process.argv[2];
const commitMessage = fs.readFileSync(commitMsgFile, "utf8").trim();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_TOPIC_ID = process.env.TELEGRAM_TOPIC_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || !TELEGRAM_TOPIC_ID) {
  console.error("❌ Missing Telegram environment variables");
  console.error("Loaded .env from:", path.resolve(__dirname, "../.env"));
  process.exit(0); // do not block commit
}

const body = {
  token: TELEGRAM_BOT_TOKEN,
  chat_id: TELEGRAM_CHAT_ID,
  topic_id: TELEGRAM_TOPIC_ID,
  message: commitMessage,
};

(async () => {
  try {
    const res = await fetch("https://telapi.fazelidev.ir/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("⚠️ Telegram API error:", res.status, text);
      process.exit(0); // do not block commit
    }

    console.log("✅ Commit message sent to Telegram");
    process.exit(0);
  } catch (err) {
    console.error("⚠️ Failed to send Telegram message:", err?.message || err);
    process.exit(0); // do not block commit
  }
})();
