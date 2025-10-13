// backend/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import aiRouter from "./routes/ai.js";

const app = express();

// 🌐 CORS (aperto per sviluppo locale con Expo)
const ORIGIN = process.env.ALLOWED_ORIGIN || "*";

app.use(
  helmet({
    contentSecurityPolicy: false, // disattiva in sviluppo per compatibilità Expo
  })
);

app.use(
  cors({
    origin: ORIGIN,
    methods: ["GET", "POST"],
    credentials: false,
  })
);

// 🧩 Body parser
app.use(express.json({ limit: "1mb" }));

// 🛡️ Rate limit base (evita spam verso le API)
app.use("/api/", rateLimit({ windowMs: 10 * 60 * 1000, max: 60 }));

// ❤️ Health check (per test rapido)
app.get("/api/health", (req, res) => res.json({ ok: true, ts: Date.now() }));

// 🧠 Rotte Wizzy (chat, quiz, lezioni)
app.use("/api/ai", aiRouter);

// 🚀 Server in ascolto su rete locale
const PORT = process.env.PORT || 5050;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🪄 Wizzy backend running on http://192.168.1.14:${PORT}`);
  console.log(`📘 Rotte disponibili:
  - /api/ai/ask
  - /api/ai/generate-quiz
  - /api/ai/lezioni/:materia/:numero
  - /api/health
  `);
});
