import { Router } from "express";
import nodemailer from "nodemailer";

interface RegisterBody {
  name?: string;
  email?: string;
  phone?: string;
}

const router = Router();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value;
};

const buildCalendarLink = ({ name }: { name: string }) => {
  const start = "20260601T160000Z";
  const end = "20260601T170000Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Вебинар по списанию долгов",
    dates: `${start}/${end}`,
    details: `Здравствуйте, ${name}!\n\nВы зарегистрированы на вебинар.`,
    location: "Онлайн",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone } = req.body as RegisterBody;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false });
    }

    const transporter = nodemailer.createTransport({
      host: requireEnv("EMAIL_HOST"),
      port: Number(requireEnv("EMAIL_PORT")),
      secure: Number(requireEnv("EMAIL_PORT")) === 465,
      auth: {
        user: requireEnv("EMAIL_USER"),
        pass: requireEnv("EMAIL_PASS"),
      },
    });

    const calendarLink = buildCalendarLink({ name });

    await transporter.sendMail({
      from: `Регистрация <${requireEnv("EMAIL_USER")}>`,
      to: email,
      subject: "Вы зарегистрированы на вебинар",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;">
          <h2 style="margin:0 0 12px;">Здравствуйте, ${escapeHtml(name)}!</h2>
          <p style="margin:0 0 16px;">Спасибо за регистрацию. Нажмите кнопку ниже, чтобы добавить вебинар в календарь.</p>
          <a
            href="${calendarLink}"
            style="display:inline-block;padding:12px 18px;border-radius:8px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;"
            target="_blank"
            rel="noopener noreferrer"
          >
            Добавить в календарь
          </a>
        </div>
      `,
    });

    const botToken = requireEnv("TELEGRAM_BOT_TOKEN");
    const chatId = requireEnv("TELEGRAM_CHAT_ID");
    const appUrl = process.env.APP_URL ?? "http://localhost:5173";
    const telegramApiBase = process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org";

    try {
      const telegramResponse = await fetch(`${telegramApiBase}/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: [
            "Новая заявка с формы регистрации",
            `Имя: ${name}`,
            `Email: ${email}`,
            `Телефон: ${phone}`,
          ].join("\n"),
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Посмотреть заявку",
                  url: appUrl,
                },
              ],
            ],
          },
        }),
        signal: AbortSignal.timeout(20_000),
      });

      if (!telegramResponse.ok) {
        const telegramBody = await telegramResponse.text();
        console.error("Telegram API returned non-OK response", telegramResponse.status, telegramBody);
      }
    } catch (telegramError) {
      console.error("Telegram notification error", telegramError);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Register route error", error);
    return res.status(500).json({ success: false });
  }
});

export default router;
