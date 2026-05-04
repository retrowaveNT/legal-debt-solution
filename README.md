# legal-debt-solution

## Deploy на Render

Чтобы форма регистрации работала в продакшене, фронтенд должен отправлять данные в API-сервис, а API должен разрешать CORS от домена фронтенда.

### 1) Backend (Web Service)

Создайте отдельный Web Service для `server/server.ts`.

**Build Command:**

```bash
npm ci
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
- `APP_URL` — URL фронтенда (для ссылок в Telegram)
- `ORG_SITE` — публичный сайт компании для ссылок в письмах (например, `https://лояльность.com`)
- `ORG_ADDRESS` — адрес компании для подписи в письмах
- `ORG_LOGO_URL` — URL логотипа для писем
- `ORG_SPEAKER_IMAGE_URL` — URL фото спикера для письма регистрации
- `TELEGRAM_API_BASE` (опционально, по умолчанию `https://api.telegram.org`)
- `ORG_PHONE` (опционально, для подписи в письмах)
- `ORG_EMAIL` (опционально, для подписи в письмах)

### 2) Frontend (Static Site)

Для фронтенда задайте переменную окружения:

- `VITE_API_BASE_URL` — URL backend-сервиса на Render (например, `https://your-api.onrender.com`)

После изменения переменных перезапустите деплой обоих сервисов.

### 3) Локальная разработка

Если `VITE_API_BASE_URL` не задан, фронт использует относительный путь `/api/register` (через Vite proxy в режиме `npm run dev`).


API routes:
- `POST /api/register` — регистрация на вебинар
- `POST /api/lead-magnet` — отправка PDF-гида
