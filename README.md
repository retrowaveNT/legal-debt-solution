# legal-debt-solution

## Deploy на Render

Чтобы форма регистрации работала в продакшене, фронтенд должен отправлять данные в API-сервис, а API должен разрешать CORS от домена фронтенда.

### 1) Backend + Frontend (Web Service)

Рекомендуемый вариант — один Render Web Service: он отдаёт собранный фронтенд из `dist` и обрабатывает `/api/*` на том же домене. Так форма отправляет заявку на относительный путь `/api/register` без CORS и без обязательного `VITE_API_BASE_URL`.

**Build Command:**

```bash
npm ci && npm run build
```

**Start Command:**

```bash
npm run start
```

**Environment Variables:**

- `PORT` — Render подставит автоматически
- `CORS_ORIGIN` — URL фронтенда (например, `https://your-frontend.onrender.com`)
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_SECURE` — `true` для SSL (обычно порт `465`), `false` для STARTTLS (`587`)
- `EMAIL_REQUIRE_TLS` — `true` для принудительного STARTTLS (обычно при `587`)
- `RESEND_API_KEY` (опционально, если отправляете письма через HTTPS API Resend вместо SMTP)
- `RESEND_FROM_EMAIL` (опционально, подтвержденный отправитель в Resend)
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `APP_URL` — URL приложения (для текущего деплоя: `https://loyalnost.onrender.com`)
- `WEBINAR_START_AT` — ISO-время старта вебинара для включения Telegram-уведомлений о посещении (по умолчанию `2026-08-29T12:00:00.000Z`)
- `ORG_SITE` — публичный сайт компании для ссылок в письмах (например, `https://лояльность.com`)
- `ORG_ADDRESS` — адрес компании для подписи в письмах
- `ORG_LOGO_URL` — URL логотипа для писем
- `ORG_SPEAKER_IMAGE_URL` — URL фото спикера для письма регистрации
- `TELEGRAM_API_BASE` (опционально, по умолчанию `https://api.telegram.org`)
- `ORG_PHONE` (опционально, для подписи в письмах)
- `ORG_EMAIL` (опционально, для подписи в письмах)

### 2) Frontend как отдельный Static Site (если нужен)

Если фронтенд развёрнут отдельным Static Site, обязательно задайте переменную окружения:

- `VITE_API_BASE_URL` — URL API-сервиса на Render. Если API и фронтенд работают на `https://loyalnost.onrender.com`, переменную можно не задавать

Без этой переменной статический хостинг может отдать `index.html` вместо `/api/register`, и форма покажет ошибку отправки. После изменения переменных перезапустите деплой обоих сервисов.

### 3) Локальная разработка

Если `VITE_API_BASE_URL` не задан, фронт использует относительный путь `/api/register` (через Vite proxy в режиме `npm run dev` или через единый Web Service в продакшене).

API routes:

- `POST /api/register` — регистрация на вебинар
- `POST /api/lead-magnet` — отправка PDF-гида
