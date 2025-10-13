import { Router } from "express";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const bannedRegex =
  /(arma|violenza|morte|sesso|drog|alcol|odio|razz|suicid|autolesion|politica|religion)/i;

// ==============================
// 🧠 CHAT WIZZY
// ==============================
router.post("/ask", async (req, res) => {
  try {
    const { message = "", childName = "amico", age = 8, history = [] } = req.body;

    if (bannedRegex.test(message)) {
      return res.json({
        reply:
          "Eh-eh! Wizzy non parla di questi argomenti. Scegliamo qualcosa di allegro e adatto alla scuola! 🌟",
      });
    }

    // 🔹 Moderazione OpenAI
    try {
      const mod = await openai.moderations.create({
        model: "omni-moderation-latest",
        input: message,
      });
      if (mod.results?.[0]?.flagged) {
        return res.json({
          reply:
            "Questa domanda non va bene per la nostra magia. Parliamo di natura, scienza o animali! 🪄",
        });
      }
    } catch (e) {
      console.warn("Moderation fallback:", e.message);
    }

    const messages = [
      {
        role: "system",
        content: `
Sei Wizzy, un maghetto gentile che parla con bambini di ${age} anni.
Regole:
- Linguaggio semplice, allegro e incoraggiante.
- Evita temi adulti o tristi.
- Ricorda il contesto del dialogo precedente.
- Se il bambino risponde brevemente (es. “sì”, “no”), deduci il riferimento e prosegui naturalmente.
- Concludi sempre con una domanda o incoraggiamento coerente.
- Mantieni risposte brevi (max 50 parole).`,
      },
    ];

    for (const h of history) {
      if (h.role && h.content) messages.push({ role: h.role, content: h.content });
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 200,
      messages,
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "La magia oggi fa i capricci! Proviamo a parlare di animali o pianeti? ✨";

    if (bannedRegex.test(reply)) {
      return res.json({
        reply:
          "Preferisco parlare di argomenti scolastici e magici! Vuoi scoprire una curiosità su animali o pianeti? ✨",
      });
    }

    res.json({ reply });
  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({
      reply: "Oh-oh! La magia si è un po’ incantata. Riproviamo tra poco! ✨",
    });
  }
});

// ==============================
// 🧩 GENERAZIONE QUIZ
// ==============================
router.post("/generate-quiz", async (req, res) => {
  try {
    const { topic = "Inglese", level = 1, numQuestions = 5, age = 8 } = req.body;

    // 🎲 Mini-temi casuali
    const temi = [
      "animali",
      "colori",
      "cibo",
      "scuola",
      "natura",
      "corpo umano",
      "emozioni",
      "spazio",
      "tempo",
      "oggetti quotidiani",
      "sport",
      "geografia",
    ];
    const temaCasuale = temi[Math.floor(Math.random() * temi.length)];

    console.log(`🚀 Generazione quiz per: ${topic} livello ${level} (tema: ${temaCasuale})`);

const prompt = `
Sei Wizzy, un mago gentile che crea quiz di inglese per bambini di 6–10 anni.
Genera ${numQuestions} domande in formato JSON, seguendo questo schema:

[
  {
    "type": "multiple" | "fill",
    "q": "Domanda in italiano o frase inglese da completare con una sola parola precisa",
    "options": ["opzione1", "opzione2", "opzione3"],
    "answer": "risposta corretta",
    "pronunciation": "pronuncia semplificata in italiano (solo per le parole inglesi)",
    "info": "Spiegazione chiara e simpatica in italiano"
  }
]

⭐ Livello: ${level} (1 facile, 5 difficile)
📘 Materia: ${topic}
🎨 Tema: ${temaCasuale}

🎯 Regole fondamentali:
- Se il tipo è "fill", la parola mancante deve essere ovvia e unica.
  Es.: "The cat is ____." → risposta: "black"
  ❌ Evita frasi come "The ____ is pink" o troppo generiche.
- Fornisci SEMPRE un contesto logico (animale, frutto, oggetto, colore, azione semplice).
- Mantieni la lingua inglese semplice, grammatica corretta e comprensibile.
- Tutte le spiegazioni ("info") devono essere in italiano e spiegare cosa significa la frase.
- Inserisci sempre la pronuncia semplificata (es. "apple" → "èppol", "red" → "rèd").

💪 Scala la difficoltà:
- Livello 1 → parole base (colori, animali, cibo).
- Livello 3 → frasi semplici con verbo “to be” o “to have”.
- Livello 5 → frasi complete o piccole domande, ma con risposte precise (es. "Where is the cat?" → "in the garden").

❌ Evita:
- Risposte multiple plausibili.
- Frasi ambigue o troppo astratte.
- Parole non adatte a bambini o di livello superiore a A1.

Rispondi solo con il JSON puro, senza testo extra o commenti.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 1.1,
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    let raw = completion.choices?.[0]?.message?.content?.trim() || "";
    console.log("🧠 OpenAI quiz output RAW:", raw.slice(0, 200) + "...");

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Nessun JSON valido trovato nell’output");

    const quiz = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(quiz) || quiz.length === 0) {
      throw new Error("Quiz vuoto o non valido");
    }

    console.log(`✅ Quiz generato con ${quiz.length} domande`);
    res.json({ topic, quiz });
  } catch (err) {
    console.error("❌ Errore generazione quiz:", err);
    res.status(500).json({
      quiz: [],
      error: "Impossibile generare il quiz. Riprova tra poco.",
    });
  }
});

// ==============================
// 🧭 LEZIONI GUIDATE
// ==============================
router.get("/lezioni/:materia/:numero", async (req, res) => {
  const { materia, numero } = req.params; // ✅ spostato fuori dal try
  const lezioneNum = parseInt(numero);

  try {
    console.log(`📘 Generazione lezione ${lezioneNum} per: ${materia}`);

const prompt = `
Sei Wizzy, un mago gentile che insegna ${materia} a bambini tra 6 e 10 anni.
Crea la LEZIONE ${lezioneNum} del percorso magico di ${materia}, composta da 10-15 domande guidate in formato JSON.

Ogni lezione deve basarsi su argomenti progressivi:
1️⃣ Colori e oggetti
2️⃣ Animali e verbo "to be"
3️⃣ Cibo e bevande
4️⃣ Casa e scuola
5️⃣ Persone e famiglia
6️⃣ Azioni quotidiane con "to have" e "to like"
7️⃣ Tempo e meteo
8️⃣ Luoghi e direzioni
9️⃣ Emozioni e congiunzioni
🔟 Revisione finale e frasi complete

Crea SOLO la lezione numero ${lezioneNum}, concentrandoti sull’argomento corrispondente e adattandoti alla difficoltà del percorso.

Ogni domanda deve seguire questa struttura:
{
  "q": "Domanda o frase da completare",
  "options": ["opzione1", "opzione2", "opzione3"],
  "answer": "risposta corretta",
  "type": "multiple" | "fill",
  "hint": "Breve suggerimento amichevole (es. 'Pensa al colore del sole ☀️')",
  "info": "Spiegazione educativa simpatica",
  "pronunciation": "pronuncia semplificata (solo se in inglese)"
}

Rispondi solo con JSON puro.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    let raw = completion.choices[0].message.content.trim();

    // ✅ Estrai il blocco JSON anche se ci sono errori o testo extra
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Nessun JSON valido trovato");

    let lezione;
    try {
      lezione = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.warn("⚠️ JSON parse non riuscito, uso fallback base");
      throw new Error("JSON non valido");
    }

    if (!Array.isArray(lezione) || lezione.length === 0)
      throw new Error("Lezione vuota o non valida");

    console.log(`✅ Lezione ${lezioneNum} generata con ${lezione.length} domande`);
    res.json({ materia, numero: lezioneNum, lezione });
  } catch (err) {
    console.error("❌ Errore generazione lezione:", err);

    // ✅ FALLBACK sempre sicuro
    const fallback = [
      {
        q: "Come si dice 'gatto' in inglese?",
        options: ["Dog", "Cat", "Fish"],
        answer: "Cat",
        type: "multiple",
        hint: "Pensa a un animale che fa 'miao' 🐱",
        info: "'Cat' significa gatto in inglese!",
        pronunciation: "kæt",
      },
      {
        q: "Come si dice 'rosso' in inglese?",
        options: ["Red", "Blue", "Green"],
        answer: "Red",
        type: "multiple",
        hint: "È il colore di una mela 🍎",
        info: "'Red' vuol dire rosso.",
        pronunciation: "rèd",
      },
    ];

    res.json({ materia, numero: lezioneNum, lezione: fallback });
  }
});


export default router;
