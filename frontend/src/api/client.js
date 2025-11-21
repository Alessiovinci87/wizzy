// frontend/src/api/client.js
const rawApiUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://192.168.1.14:5050";

export const API_URL = rawApiUrl.replace(/\/$/, "");

// ⏱ funzione di timeout per evitare blocchi infiniti
const fetchWithTimeout = (url, options, timeout = 8000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: nessuna risposta dal server")), timeout)
    ),
  ]);
};

// 🔹 aggiornata per includere la cronologia completa (history)
export async function askWizzy(message, childName = "amico", age = 8, history = []) {
  const payload = { message, childName, age, history };
  console.log("📤 Invio a backend:", payload);

  try {
    const res = await fetchWithTimeout(`${API_URL}/api/ai/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("📥 Status backend:", res.status);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    console.log("✅ Dati ricevuti:", data);
    return data;
  } catch (err) {
    console.error("❌ Errore fetch Wizzy:", err.message);
    return {
      reply:
        "Oh-oh! Wizzy non riesce a sentirti! 😅 Controlla la connessione o riavvia la magia! ✨",
    };
  }
}
export async function generateQuiz(topic = "Inglese", level = 1, numQuestions = 5, age = 8) {
  try {
    const res = await fetch(`${API_URL}/api/ai/generate-quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, level, numQuestions, age }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log("📘 Quiz generato:", data);
    return data;
  } catch (err) {
    console.error("❌ Errore fetch generateQuiz:", err.message);
    return { quiz: [] };
  }
}

export async function fetchLesson(materia = "inglese", numero = 1, signal) {
  const url = `${API_URL}/api/ai/lezioni/${materia}/${numero}`;

  const res = await fetch(url, { method: "GET", signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
