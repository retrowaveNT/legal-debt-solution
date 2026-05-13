import "dotenv/config";
import express from "express";
import path from "node:path";
import registerRouter from "./routes/register";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const configuredCorsOrigins = [
  process.env.CORS_ORIGIN,
  process.env.CORS_ORIGINS,
  "https://loyalnost.onrender.com",
  "https://legal-debt-solution.onrender.com",
  "https://legal-debt-solution-backend.onrender.com",
]
  .flatMap((origin) => origin?.split(",") ?? [])
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const allowedOrigins = new Set(configuredCorsOrigins);
const allowAnyOrigin =
  allowedOrigins.has("*") || configuredCorsOrigins.length === 0;
const clientDistPath = path.resolve(process.cwd(), "dist");

const getCorsOrigin = (requestOrigin?: string) => {
  if (!requestOrigin) return allowAnyOrigin ? "*" : undefined;
  const normalizedOrigin = requestOrigin.replace(/\/$/, "");

  if (allowAnyOrigin || allowedOrigins.has(normalizedOrigin)) {
    return requestOrigin;
  }

  return undefined;
};

app.use(express.json());
app.use((req, res, next) => {
  const corsOrigin = getCorsOrigin(req.headers.origin);

  if (corsOrigin) {
    res.header("Access-Control-Allow-Origin", corsOrigin);
  }

  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(corsOrigin ? 204 : 403);
  }

  next();
});
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use("/api", registerRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(express.static(clientDistPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  return res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`);
});
