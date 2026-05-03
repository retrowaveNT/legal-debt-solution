import { Router } from "express";
import nodemailer from "nodemailer";

interface RegisterBody {
  name?: string;
  email?: string;
  phone?: string;
}

const router = Router();

const toBool = (value: string | undefined, fallback: boolean) => {
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

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

    const calendarLink = buildCalendarLink({ name });

    const emailEnvPresent = Boolean(
      process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS,
    );

    if (!emailEnvPresent) {
      console.warn("EMAIL_* variables are missing, skipping confirmation email");
    } else {
      try {
        const emailUser = requireEnv("EMAIL_USER");
        const emailPort = Number(requireEnv("EMAIL_PORT"));
        const emailSecure = toBool(process.env.EMAIL_SECURE, emailPort === 465);
        const emailRequireTls = toBool(process.env.EMAIL_REQUIRE_TLS, emailPort === 587);
        const transporter = nodemailer.createTransport({
          host: requireEnv("EMAIL_HOST"),
          port: emailPort,
          secure: emailSecure,
          requireTLS: emailRequireTls,
          auth: {
            user: emailUser,
            pass: requireEnv("EMAIL_PASS"),
          },
          connectionTimeout: 10_000,
          greetingTimeout: 10_000,
          socketTimeout: 15_000,
        });

        await transporter.verify();

        await transporter.sendMail({
          from: `Регистрация <${emailUser}>`,
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
      } catch (emailError) {
        console.error("Confirmation email error", {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: process.env.EMAIL_SECURE,
          requireTLS: process.env.EMAIL_REQUIRE_TLS,
          error: emailError,
        });
      }
    }

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
