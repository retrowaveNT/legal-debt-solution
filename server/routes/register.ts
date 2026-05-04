import { Router } from "express";
import nodemailer from "nodemailer";

interface RegisterBody {
  name?: string;
  email?: string;
  phone?: string;
}

interface LeadMagnetBody {
  name?: string;
  email?: string;
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

const ORG_NAME = 'ЮК "Лояльность"';
const ORG_PHONE = process.env.ORG_PHONE ?? "+79676399556";
const ORG_EMAIL = process.env.ORG_EMAIL ?? "lawyer@лояльность.com";
const ORG_SITE = process.env.ORG_SITE ?? "https://лояльность.com";
const ORG_ADDRESS = process.env.ORG_ADDRESS ?? "г. Екатеринбург, ул. Кузнечная 92/2, офис 617";
const ORG_LOGO_URL = process.env.ORG_LOGO_URL ?? "https://legal-debt-solution.onrender.com/assets/logo-C6wkK0x0.png";
const ORG_SPEAKER_IMAGE_URL = process.env.ORG_SPEAKER_IMAGE_URL ?? "https://legal-debt-solution.onrender.com/assets/speaker-oa9mlwt4.jpg";

const buildYandexCalendarLink = ({ name }: { name: string }) => {
  const params = new URLSearchParams({
    name: "Вебинар: 3 законных способа решить проблему с долгами",
    description: `Здравствуйте, ${name}!\n\nВы зарегистрированы на вебинар ЮК «Лояльность».`,
    location: "Онлайн",
    start: "20260515T170000",
    end: "20260515T180000",
    tz_id: "Europe/Moscow",
  });

  return `https://calendar.yandex.ru/event?${params.toString()}`;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const createTransporter = () => {
  const emailUser = requireEnv("EMAIL_USER");
  const emailPort = Number(requireEnv("EMAIL_PORT"));
  const emailSecure = toBool(process.env.EMAIL_SECURE, emailPort === 465);
  const emailRequireTls = toBool(process.env.EMAIL_REQUIRE_TLS, emailPort === 587);

  return {
    emailUser,
    transporter: nodemailer.createTransport({
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
    }),
  };
};

const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL;

  if (resendApiKey && resendFrom) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [to],
        subject,
        html,
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend API error ${response.status}: ${body}`);
    }

    return;
  }

  const { emailUser, transporter } = createTransporter();
  await transporter.verify();
  await transporter.sendMail({ from: `ЮК Лояльность <${emailUser}>`, to, subject, html });
};

const sendTelegramNotification = async (text: string) => {
  const botToken = requireEnv("TELEGRAM_BOT_TOKEN");
  const chatId = requireEnv("TELEGRAM_CHAT_ID");
  const telegramApiBase = process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org";

  const telegramResponse = await fetch(`${telegramApiBase}/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!telegramResponse.ok) {
    const telegramBody = await telegramResponse.text();
    console.error("Telegram API returned non-OK response", telegramResponse.status, telegramBody);
  }
};

const webinarEmailHtml = ({ name, calendarLink }: { name: string; calendarLink: string }) => `
  <div style="font-family:Inter,Arial,sans-serif;background:#f3f6fb;padding:24px;color:#1f2937;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="padding:18px 24px;background:#ffffff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:12px;">
        <img src="${ORG_LOGO_URL}" alt="Логотип ЮК Лояльность" style="height:42px;width:auto;display:block;"/>
        <div style="font-size:13px;color:#334155;">Юридическая компания «Лояльность»</div>
      </div>
      <div style="background:linear-gradient(135deg,#0f172a,#1e3a8a);padding:28px;color:#fff;">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.85;">${ORG_NAME}</div>
        <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;">Вы зарегистрированы на вебинар</h1>
      </div>
      <div style="padding:24px;line-height:1.65;">
        <p style="margin:0 0 10px;">Здравствуйте, <strong>${escapeHtml(name)}</strong>!</p>
        <p style="margin:0 0 14px;">Спасибо за регистрацию на вебинар <strong>«3 законных способа решить проблему с долгами»</strong>.</p>
        <img src="${ORG_SPEAKER_IMAGE_URL}" alt="Спикер ЮК Лояльность" style="width:100%;max-width:592px;height:auto;border-radius:12px;margin:0 0 16px;display:block;"/>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin:0 0 18px;">
          <div><strong>Дата:</strong> 15 мая 2026</div>
          <div><strong>Время:</strong> 17:00 МСК</div>
          <div><strong>Формат:</strong> онлайн</div>
        </div>
        <a href="${calendarLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#e11d48;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">Добавить в Яндекс Календарь</a>
        <h3 style="margin:26px 0 8px;font-size:18px;color:#0f172a;">Что будет на вебинаре</h3>
        <ul style="margin:0 0 18px 18px;padding:0;">
          <li>3 законных стратегии решения долговой нагрузки</li>
          <li>Риски, ограничения и типовые ошибки</li>
          <li>Пошаговый план действий под вашу ситуацию</li>
        </ul>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:14px;color:#475569;">
          <strong>${ORG_NAME}</strong><br/>
          Телефон: <a href="tel:${ORG_PHONE}" style="color:#1d4ed8;text-decoration:none;">${ORG_PHONE}</a><br/>
          Email: <a href="mailto:${ORG_EMAIL}" style="color:#1d4ed8;text-decoration:none;">${ORG_EMAIL}</a><br/>
          Сайт: <a href="${ORG_SITE}" style="color:#1d4ed8;text-decoration:none;">${ORG_SITE}</a><br/>
          Адрес: ${ORG_ADDRESS}
        </div>
      </div>
    </div>
  </div>`;

const leadMagnetEmailHtml = ({ name }: { name: string }) => `
  <div style="font-family:Inter,Arial,sans-serif;background:#f3f6fb;padding:24px;color:#1f2937;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#0f172a,#1e3a8a);padding:28px;color:#fff;">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.85;">${ORG_NAME}</div>
        <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;">Ваш PDF-гайд готов</h1>
      </div>
      <div style="padding:24px;line-height:1.65;">
        <p style="margin:0 0 10px;">Здравствуйте, <strong>${escapeHtml(name)}</strong>!</p>
        <p style="margin:0 0 16px;">Спасибо за интерес к материалам ${ORG_NAME}. Ниже ссылка на скачивание гайда:</p>
        <a href="${ORG_SITE}/downloads/guide-debt-solutions.pdf" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">Скачать PDF-гайд</a>
        <p style="margin:18px 0 0;color:#475569;">Если возникнут вопросы по вашей ситуации — ответьте на это письмо или позвоните нам.</p>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:14px;color:#475569;">
          <strong>${ORG_NAME}</strong><br/>
          Телефон: <a href="tel:${ORG_PHONE}" style="color:#1d4ed8;text-decoration:none;">${ORG_PHONE}</a><br/>
          Email: <a href="mailto:${ORG_EMAIL}" style="color:#1d4ed8;text-decoration:none;">${ORG_EMAIL}</a><br/>
          Сайт: <a href="${ORG_SITE}" style="color:#1d4ed8;text-decoration:none;">${ORG_SITE}</a><br/>
          Адрес: ${ORG_ADDRESS}
        </div>
      </div>
    </div>
  </div>`;

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone } = req.body as RegisterBody;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false });
    }

    res.json({ success: true });

    void (async () => {
      try {
        const calendarLink = buildYandexCalendarLink({ name });
        await sendEmail({
          to: email,
          subject: "Вы зарегистрированы на вебинар — ЮК Лояльность",
          html: webinarEmailHtml({ name, calendarLink }),
        });
      } catch (emailError) {
        console.error("Confirmation email error", emailError);
      }

      try {
        await sendTelegramNotification([
          "Новая заявка на вебинар",
          `Имя: ${name}`,
          `Email: ${email}`,
          `Телефон: ${phone}`,
        ].join("\n"));
      } catch (telegramError) {
        console.error("Telegram notification error", telegramError);
      }
    })();

    return;
  } catch (error) {
    console.error("Register route error", error);
    return res.status(500).json({ success: false });
  }
});

router.post("/lead-magnet", async (req, res) => {
  try {
    const { name, email } = req.body as LeadMagnetBody;

    if (!name || !email) {
      return res.status(400).json({ success: false });
    }

    res.json({ success: true });

    void (async () => {
      try {
        await sendEmail({
          to: email,
          subject: "Ваш PDF-гайд — ЮК Лояльность",
          html: leadMagnetEmailHtml({ name }),
        });
      } catch (emailError) {
        console.error("Lead magnet email error", emailError);
      }

      try {
        await sendTelegramNotification(["Новая заявка на PDF-гайд", `Имя: ${name}`, `Email: ${email}`].join("\n"));
      } catch (telegramError) {
        console.error("Telegram lead-magnet notification error", telegramError);
      }
    })();

    return;
  } catch (error) {
    console.error("Lead magnet route error", error);
    return res.status(500).json({ success: false });
  }
});

export default router;
