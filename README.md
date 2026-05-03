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
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `APP_URL` — URL фронтенда
- `TELEGRAM_API_BASE` (опционально, по умолчанию `https://api.telegram.org`)

### 2) Frontend (Static Site)

Для фронтенда задайте переменную окружения:

- `VITE_API_BASE_URL` — URL backend-сервиса на Render (например, `https://your-api.onrender.com`)

После изменения переменных перезапустите деплой обоих сервисов.

### 3) Локальная разработка

Если `VITE_API_BASE_URL` не задан, фронт использует относительный путь `/api/register` (через Vite proxy в режиме `npm run dev`).
