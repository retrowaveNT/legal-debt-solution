import "dotenv/config";
import express from "express";
import registerRouter from "./routes/register";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());
app.use("/api", registerRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`);
});
