// backend/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import aiRouter from "./routes/ai.js";
import lessonsRouter from "./routes/wizzyLessons.js";

const app = express();

// 🌐 CORS helper per Expo / reti locali
const EXPO_PORTS = ["19000", "19006", "8081"];

const parseList = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const envOrigins = new Set(parseList(process.env.ALLOWED_ORIGINS));
const allowedOrigins = new Set([
  ...envOrigins,
  ...EXPO_PORTS.flatMap((port) => [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ]),
]);

const allowedPorts = new Set([
  ...EXPO_PORTS,
  ...parseList(process.env.ALLOWED_PORTS),
]);

const isPrivateHost = (hostname = "") => {
  if (!hostname) return false;
  if (["localhost", "127.0.0.1"].includes(hostname)) return true;
  if (hostname.startsWith("10.")) return true;
  if (hostname.startsWith("192.168.")) return true;

  if (hostname.startsWith("172.")) {
    const secondOctet = Number(hostname.split(".")[1]);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }

  return false;
};

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // richieste server-to-server o strumenti come Thunder Client
  if (allowedOrigins.has(origin)) return true;

  try {
    const parsed = new URL(origin);
    const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");

    if (["http:", "https:"].includes(parsed.protocol) && isPrivateHost(parsed.hostname)) {
      if (allowedPorts.size === 0 || allowedPorts.has(port)) {
        allowedOrigins.add(origin); // cache dinamica
        return true;
      }
    }
  } catch (err) {
    console.warn("⚠️ CORS origin parsing error:", err.message);
  }

  return false;
};

app.use(
  helmet({
    contentSecurityPolicy: false, // disattiva in sviluppo per compatibilità Expo
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.warn("❌ Origine CORS non autorizzata:", origin);
      return callback(new Error("CORS non autorizzato"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
app.use("/api/ai", lessonsRouter);

// 🚀 Server in ascolto su rete locale
const PORT = process.env.PORT || 5050;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🪄 Wizzy backend running on http://192.168.1.14:${PORT}`);
  console.log(`📘 Rotte disponibili:
  - /api/ai/ask
  - /api/ai/generate-quiz
  - /api/ai/genera-lezione
  - /api/ai/lezioni/:materia/:numero
  - /api/health
  `);
});
