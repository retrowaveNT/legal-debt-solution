import { Router } from "express";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import punycode from "node:punycode";

interface RegisterBody {
  name?: string;
  email?: string;
  phone?: string;
}

interface LeadMagnetBody {
  name?: string;
  email?: string;
}
interface BizonViewer {
  name?: string;
  email?: string;
  phone?: string;
}

interface WebinarLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  registeredAt?: string;
  attended: boolean;
  currentlyOnline: boolean;
  firstSeenAt?: string;
  lastSeenAt?: string;
  lastSyncedAt?: string;
  attendanceNotifiedAt?: string;
  source: "registration" | "bizon";
  bizon?: BizonViewer;
}

interface WebinarLeadsStore {
  updatedAt: string;
  leads: WebinarLead[];
}

const router = Router();
let hasAttendanceBaseline = false;
let isPresenceSyncRunning = false;

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
const APP_URL = process.env.APP_URL ?? "https://loyalnost.onrender.com";
const ORG_SITE = process.env.ORG_SITE ?? "https://лояльность.com";
const ORG_ADDRESS =
  process.env.ORG_ADDRESS ?? "г. Екатеринбург, ул. Кузнечная 92/2, офис 617";
const ORG_LOGO_URL =
  process.env.ORG_LOGO_URL ??
  "https://loyalnost.onrender.com/assets/logo-C6wkK0x0.png";
const ORG_SPEAKER_IMAGE_URL =
  process.env.ORG_SPEAKER_IMAGE_URL ??
  "https://loyalnost.onrender.com/assets/speaker-oa9mlwt4.jpg";
const PDF_FILE_NAME = "Первые 7 шагов для решения проблем с долгами.pdf";
const WEBINAR_JOIN_URL =
  process.env.WEBINAR_JOIN_URL ??
  "https://start.bizon365.ru/room/207663/133728";
const WEBINAR_DATE_TEXT = "29 августа 2026";
const WEBINAR_YANDEX_START = "20260829T150000";
const WEBINAR_YANDEX_END = "20260829T160000";
const WEBINAR_GOOGLE_DATES = "20260829T120000Z/20260829T130000Z";
const WEBINAR_START_AT = new Date(
  process.env.WEBINAR_START_AT ?? "2026-08-29T12:00:00.000Z",
);
const CRM_LEADS_EMAIL = "lead.loyalnost@gmail.com";
const WEBINAR_LEADS_FILE =
  process.env.WEBINAR_LEADS_FILE ??
  path.resolve(process.cwd(), "data", "webinar-leads.json");

const buildYandexCalendarLink = ({ name }: { name: string }) => {
  const params = new URLSearchParams({
    name: "Вебинар: 3 законных способа решить проблему с долгами",
    description: `Здравствуйте, ${name}!\n\nВы зарегистрированы на вебинар ЮК «Лояльность».`,
    location: "Онлайн",
    start: WEBINAR_YANDEX_START,
    end: WEBINAR_YANDEX_END,
    tz_id: "Europe/Moscow",
  });

  return `https://calendar.yandex.ru/event?${params.toString()}`;
};

const buildGoogleCalendarLink = ({ name }: { name: string }) => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Вебинар: 3 законных способа решить проблему с долгами",
    details: `Здравствуйте, ${name}!\n\nВы зарегистрированы на вебинар ЮК «Лояльность».`,
    location: "Онлайн",
    dates: WEBINAR_GOOGLE_DATES,
    ctz: "Europe/Moscow",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const normalizePhoneToId = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("7")) {
    return digits.slice(1);
  }

  return digits.length > 10 ? digits.slice(-10) : digits;
};

const emptyLeadsStore = (): WebinarLeadsStore => ({
  updatedAt: new Date().toISOString(),
  leads: [],
});

let storeWriteQueue = Promise.resolve();

const readLeadsStore = async (): Promise<WebinarLeadsStore> => {
  try {
    const rawStore = await readFile(WEBINAR_LEADS_FILE, "utf8");
    const parsed = JSON.parse(rawStore) as Partial<WebinarLeadsStore>;

    return {
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      leads: Array.isArray(parsed.leads) ? parsed.leads : [],
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return emptyLeadsStore();
    }

    throw error;
  }
};

const writeLeadsStore = async (store: WebinarLeadsStore) => {
  await mkdir(path.dirname(WEBINAR_LEADS_FILE), { recursive: true });
  await writeFile(
    WEBINAR_LEADS_FILE,
    `${JSON.stringify(store, null, 2)}\n`,
    "utf8",
  );
};

const updateLeadsStore = async (
  updater: (
    store: WebinarLeadsStore,
  ) => WebinarLeadsStore | Promise<WebinarLeadsStore>,
) => {
  storeWriteQueue = storeWriteQueue
    .catch(() => undefined)
    .then(async () => {
      const currentStore = await readLeadsStore();
      const nextStore = await updater(currentStore);
      nextStore.updatedAt = new Date().toISOString();
      await writeLeadsStore(nextStore);
    });

  return storeWriteQueue;
};

const upsertRegisteredLead = async ({
  id,
  name,
  phone,
  email,
}: {
  id: string;
  name: string;
  phone: string;
  email: string;
}) => {
  const now = new Date().toISOString();

  await updateLeadsStore((store) => {
    const existingIndex = store.leads.findIndex((lead) => lead.id === id);
    const existing =
      existingIndex >= 0 ? store.leads[existingIndex] : undefined;
    const nextLead: WebinarLead = {
      id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      registeredAt: existing?.registeredAt ?? now,
      attended: existing?.attended ?? false,
      currentlyOnline: existing?.currentlyOnline ?? false,
      firstSeenAt: existing?.firstSeenAt,
      lastSeenAt: existing?.lastSeenAt,
      lastSyncedAt: existing?.lastSyncedAt,
      attendanceNotifiedAt: existing?.attendanceNotifiedAt,
      source: "registration",
      bizon: existing?.bizon,
    };

    if (existingIndex >= 0) {
      store.leads[existingIndex] = { ...existing, ...nextLead };
    } else {
      store.leads.push(nextLead);
    }

    return store;
  });
};

const mergeBizonViewersIntoStore = async (viewers: BizonViewer[]) => {
  const syncedAt = new Date().toISOString();
  const onlineIds = new Set<string>();

  await updateLeadsStore((store) => {
    for (const viewer of viewers) {
      const rawPhone = viewer.phone?.trim() ?? "";
      const id = rawPhone ? normalizePhoneToId(rawPhone) : "";
      if (!id) continue;

      onlineIds.add(id);
      const existingIndex = store.leads.findIndex((lead) => lead.id === id);
      const existing =
        existingIndex >= 0 ? store.leads[existingIndex] : undefined;
      const viewerName = formatViewerName(viewer.name);
      const viewerEmail =
        viewer.email?.trim() || existing?.email || "Почты нет";
      const nextLead: WebinarLead = {
        id,
        name: existing?.name || viewerName,
        phone: existing?.phone || rawPhone,
        email: viewerEmail,
        registeredAt: existing?.registeredAt,
        attended: true,
        currentlyOnline: true,
        firstSeenAt: existing?.firstSeenAt ?? syncedAt,
        lastSeenAt: syncedAt,
        lastSyncedAt: syncedAt,
        attendanceNotifiedAt: existing?.attendanceNotifiedAt,
        source: existing?.source ?? "bizon",
        bizon: viewer,
      };

      if (existingIndex >= 0) {
        store.leads[existingIndex] = { ...existing, ...nextLead };
      } else {
        store.leads.push(nextLead);
      }
    }

    store.leads = store.leads.map((lead) => ({
      ...lead,
      currentlyOnline: onlineIds.has(lead.id),
      lastSyncedAt: syncedAt,
    }));

    return store;
  });
};

const markAttendanceNotified = async (ids: string[]) => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return new Set<string>();

  const notifiedAt = new Date().toISOString();
  const newlyNotifiedIds = new Set<string>();

  await updateLeadsStore((store) => {
    for (const id of uniqueIds) {
      const existingIndex = store.leads.findIndex((lead) => lead.id === id);
      const existing =
        existingIndex >= 0 ? store.leads[existingIndex] : undefined;

      if (!existing || existing.attendanceNotifiedAt) continue;

      newlyNotifiedIds.add(id);
      store.leads[existingIndex] = {
        ...existing,
        attended: true,
        attendanceNotifiedAt: notifiedAt,
      };
    }

    return store;
  });

  return newlyNotifiedIds;
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
  const emailRequireTls = toBool(
    process.env.EMAIL_REQUIRE_TLS,
    emailPort === 587,
  );

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

const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL;

  if (resendApiKey && resendFrom) {
    const normalizeEmailForApi = (rawEmail: string) => {
      const normalized = rawEmail.trim();
      const atIndex = normalized.lastIndexOf("@");
      if (atIndex === -1) return normalized;
      const localPart = normalized.slice(0, atIndex);
      const domain = normalized.slice(atIndex + 1);
      return `${localPart}@${punycode.toASCII(domain)}`;
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [normalizeEmailForApi(to)],
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
  await transporter.sendMail({
    from: `ЮК Лояльность <${emailUser}>`,
    to,
    subject,
    html,
  });
};

const sendTelegramNotification = async (text: string) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.warn(
      "Telegram is not configured: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing",
    );
    return;
  }
  const telegramApiBase =
    process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org";

  const telegramResponse = await fetch(
    `${telegramApiBase}/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(20_000),
    },
  );

  if (!telegramResponse.ok) {
    const telegramBody = await telegramResponse.text();
    console.error(
      "Telegram API returned non-OK response",
      telegramResponse.status,
      telegramBody,
    );
  }
};

const fetchBizonViewers = async () => {
  const projectId = requireEnv("BIZON_PROJECT_ID");
  const token = requireEnv("BIZON_API_TOKEN");
  const limit = Number(process.env.BIZON_LIMIT ?? 100);
  const listLimit = Number(process.env.BIZON_LIST_LIMIT ?? 100);

  let webinarId = process.env.BIZON_WEBINAR_ID;

  if (!webinarId) {
    const listUrl = `https://online.bizon365.ru/api/v2/${projectId}/reports/getlist?skip=0&limit=${listLimit}`;
    const listResp = await fetch(listUrl, {
      headers: { "X-Token": token },
      signal: AbortSignal.timeout(20_000),
    });
    if (!listResp.ok) {
      throw new Error(
        `Bizon list fetch failed: ${listResp.status} ${listResp.statusText}`,
      );
    }

    const listData = (await listResp.json()) as {
      list?: Array<{ webinarId?: string; created?: string }>;
    };
    const reports = (listData.list ?? []).filter((item) => item.webinarId);
    if (reports.length === 0) {
      throw new Error("Bizon list fetch returned no webinars");
    }

    reports.sort(
      (a, b) =>
        new Date(b.created ?? 0).getTime() - new Date(a.created ?? 0).getTime(),
    );
    webinarId = reports[0].webinarId as string;
  }

  let skip = 0;
  let total = Number.POSITIVE_INFINITY;
  const allViewers: BizonViewer[] = [];

  while (allViewers.length < total) {
    const viewersUrl = `https://online.bizon365.ru/api/v2/${projectId}/reports/getviewers?webinarId=${encodeURIComponent(webinarId)}&skip=${skip}&limit=${limit}`;
    const viewersResp = await fetch(viewersUrl, {
      headers: { "X-Token": token },
      signal: AbortSignal.timeout(20_000),
    });
    if (!viewersResp.ok) {
      throw new Error(
        `Bizon viewers fetch failed: ${viewersResp.status} ${viewersResp.statusText}`,
      );
    }

    const viewersData = (await viewersResp.json()) as {
      viewers?: BizonViewer[];
      total?: number;
    };
    const batch = viewersData.viewers ?? [];
    allViewers.push(...batch);
    total = viewersData.total ?? allViewers.length;
    skip += limit;

    if (batch.length === 0) {
      break;
    }
  }

  return allViewers;
};

const formatViewerName = (name?: string) =>
  name && name.trim() ? name.trim() : "Не указано";

const isWebinarAttendanceStarted = () => {
  const startTime = WEBINAR_START_AT.getTime();
  return Number.isFinite(startTime) && Date.now() >= startTime;
};

const runPresenceSync = async () => {
  if (isPresenceSyncRunning || !isWebinarAttendanceStarted()) return;
  isPresenceSyncRunning = true;

  try {
    const viewers = await fetchBizonViewers();
    await mergeBizonViewersIntoStore(viewers);
    const viewerById = new Map<string, BizonViewer>();

    for (const viewer of viewers) {
      if (!viewer.phone) continue;
      const viewerId = normalizePhoneToId(viewer.phone);
      if (viewerId) viewerById.set(viewerId, viewer);
    }

    const viewerIds = Array.from(viewerById.keys());
    const newlyNotifiedIds = await markAttendanceNotified(viewerIds);

    if (!hasAttendanceBaseline) {
      hasAttendanceBaseline = true;
      return;
    }

    for (const viewerId of newlyNotifiedIds) {
      const viewer = viewerById.get(viewerId);
      if (!viewer) continue;

      await sendTelegramNotification(
        [
          "✅ Участник пришел на вебинар",
          `ID: ${viewerId}`,
          `Имя: ${viewer.name ?? "Не указано"}`,
          `Телефон: ${viewer.phone}`,
          `Email: ${viewer.email ?? "Почты нет"}`,
        ].join("\n"),
      );
    }
  } catch (error) {
    console.error("Webinar presence sync interval error", error);
  } finally {
    isPresenceSyncRunning = false;
  }
};

const PRESENCE_SYNC_INTERVAL_MS = Number(
  process.env.BIZON_PRESENCE_SYNC_INTERVAL_MS ?? 5_000,
);
if (PRESENCE_SYNC_INTERVAL_MS > 0) {
  void runPresenceSync();
  setInterval(() => {
    void runPresenceSync();
  }, PRESENCE_SYNC_INTERVAL_MS);
}

const webinarEmailHtml = ({
  name,
  yandexCalendarLink,
  googleCalendarLink,
}: {
  name: string;
  yandexCalendarLink: string;
  googleCalendarLink: string;
}) => `
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
          <div><strong>Дата:</strong> ${WEBINAR_DATE_TEXT}</div>
          <div><strong>Время:</strong> 15:00 МСК</div>
          <div><strong>Формат:</strong> онлайн</div>
        </div>
        <p style="margin:0 0 14px;"><strong>Ссылка на вебинар:</strong> <a href="${WEBINAR_JOIN_URL}" target="_blank" rel="noopener noreferrer" style="color:#1d4ed8;text-decoration:none;">${WEBINAR_JOIN_URL}</a></p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          <a href="${yandexCalendarLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#e11d48;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">Добавить в Яндекс Календарь</a>
          <a href="${googleCalendarLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#0f9d58;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">Добавить в Google Календарь</a>
        </div>
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

const sendCrmLeadEmail = async (ownerPayload: string) => {
  await sendEmail({
    to: CRM_LEADS_EMAIL,
    subject: "Новая регистрация на вебинар",
    html: `<p>${escapeHtml(ownerPayload)}</p>`,
  });
};

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
        <a href="${APP_URL}/downloads/guide-debt-solutions.pdf" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;">Скачать «${PDF_FILE_NAME}»</a>
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

    const leadId = normalizePhoneToId(phone);
    const leadEmail = email.trim() || "Почты нет";
    const ownerPayload = `${leadId} | ${name} | ${phone} | ${leadEmail}`;

    res.json({ success: true });

    void (async () => {
      try {
        await upsertRegisteredLead({
          id: leadId,
          name,
          phone,
          email: leadEmail,
        });
      } catch (storeError) {
        console.error("Webinar lead store error", storeError);
      }

      const yandexCalendarLink = buildYandexCalendarLink({ name });
      const googleCalendarLink = buildGoogleCalendarLink({ name });
      const [confirmationEmailResult, crmLeadEmailResult] =
        await Promise.allSettled([
          sendEmail({
            to: email,
            subject: "Вы зарегистрированы на вебинар — ЮК Лояльность",
            html: webinarEmailHtml({
              name,
              yandexCalendarLink,
              googleCalendarLink,
            }),
          }),
          sendCrmLeadEmail(ownerPayload),
        ]);

      if (confirmationEmailResult.status === "rejected") {
        console.error(
          "Confirmation email error",
          confirmationEmailResult.reason,
        );
      }

      if (crmLeadEmailResult.status === "rejected") {
        console.error(
          `CRM lead email error (${CRM_LEADS_EMAIL})`,
          crmLeadEmailResult.reason,
        );
      }

      try {
        await sendTelegramNotification(
          [
            "Новая заявка на вебинар",
            `ID: ${leadId}`,
            `Имя: ${name}`,
            `Email: ${email}`,
            `Телефон: ${phone}`,
          ].join("\n"),
        );
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
        await sendTelegramNotification(
          ["Новая заявка на PDF-гайд", `Имя: ${name}`, `Email: ${email}`].join(
            "\n",
          ),
        );
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

router.post("/webinar/sync-attendance", async (_req, res) => {
  try {
    if (!isWebinarAttendanceStarted()) {
      return res.json({
        success: true,
        processed: 0,
        sent: 0,
        skipped: "webinar_not_started",
      });
    }

    const viewers = await fetchBizonViewers();
    await mergeBizonViewersIntoStore(viewers);
    const viewerById = new Map<string, BizonViewer>();

    for (const viewer of viewers) {
      if (!viewer.phone) continue;
      const viewerId = normalizePhoneToId(viewer.phone);
      if (viewerId) viewerById.set(viewerId, viewer);
    }

    const newlyNotifiedIds = await markAttendanceNotified(
      Array.from(viewerById.keys()),
    );
    let sent = 0;

    for (const viewerId of newlyNotifiedIds) {
      const viewer = viewerById.get(viewerId);
      if (!viewer) continue;

      sent += 1;
      await sendTelegramNotification(
        [
          "✅ Участник пришел на вебинар",
          `ID: ${viewerId}`,
          `Имя: ${viewer.name ?? "Не указано"}`,
          `Телефон: ${viewer.phone}`,
          `Email: ${viewer.email ?? "Почты нет"}`,
        ].join("\n"),
      );
    }

    return res.json({ success: true, processed: viewers.length, sent });
  } catch (error) {
    console.error("Webinar attendance sync error", error);
    return res.status(500).json({ success: false });
  }
});

export default router;
