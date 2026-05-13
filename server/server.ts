import "dotenv/config";
import express from "express";
import path from "node:path";
import registerRouter from "./routes/register";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const allowedOrigin = process.env.CORS_ORIGIN ?? "*";
const clientDistPath = path.resolve(process.cwd(), "dist");

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
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
