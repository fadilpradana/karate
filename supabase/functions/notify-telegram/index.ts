import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BOT_TOKEN = "8060018635:AAFyrD6b0sjfi7u4SjsLdQB-BNYk7LRBEtM";
const CHAT_ID_ADMIN = "-4954305875"; // Grup admin
const CHAT_ID_UMUM = "-4918681666";  // Grup umum anggota

serve(async (req) => {
  try {
    const body = await req.json();
    const { type, title, url } = body;

    let chat_id = "";
    let message = "";

    if (type === "draft") {
      chat_id = CHAT_ID_ADMIN;
      message = `📝 *Draft Artikel baru perlu di moderasi*\n\n📌 Judul: *${title}*`;
    }

    if (type === "published") {
      chat_id = CHAT_ID_UMUM;
      message = `📢 Artikel baru telah *terbit*!\n\n📰 *${title}*\n🔗 ${url}`;
    }

    if (type === "monthly_report") {
      chat_id = CHAT_ID_ADMIN;
      message = `📊 *Laporan bulanan visitor website*\n\n${title}`;
    }

    if (!message) {
      return new Response("No message sent", { status: 400 });
    }

    await sendTelegram(chat_id, message);
    return new Response("Message sent", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error", { status: 500 });
  }
});

async function sendTelegram(chat_id: string, text: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id,
    text,
    parse_mode: "Markdown",
  };

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
