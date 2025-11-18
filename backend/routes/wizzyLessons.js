import express from "express";
import OpenAI from "openai";
import "dotenv/config";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const lessonSchema = {
  name: "WizzyLesson",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["intro", "vocaboli", "quiz", "next_hint"],
    properties: {
      intro: { type: "string", description: "Introduce la lezione in italiano." },
      vocaboli: {
        type: "array",
        description: "Lista di vocaboli inglesi con spiegazione in italiano.",
        minItems: 2,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["word", "meaning", "pronunciation", "context"],
          properties: {
            word: { type: "string", description: "Parola inglese tra virgolette." },
            meaning: { type: "string", description: "Traduzione e spiegazione in italiano." },
            pronunciation: { type: "string", description: "Pronuncia semplificata." },
            context: {
              type: "string",
              description: "Frase o mini storia IN ITALIANO che spiega come usare la parola.",
            },
          },
        },
      },
      quiz: {
        type: "array",
        description: "Domande del quiz in italiano.",
        minItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "q", "options", "answer", "hint", "info", "pronunciation"],
          properties: {
            type: { type: "string", enum: ["choice", "fill"] },
            q: { type: "string", description: "Domanda in italiano." },
            options: {
              type: "array",
              minItems: 3,
              maxItems: 4,
              items: { type: "string" },
            },
            answer: { type: "string" },
            hint: { type: "string" },
            info: { type: "string" },
            pronunciation: {
              type: "string",
              description: "Pronuncia semplificata della risposta inglese.",
            },
          },
        },
      },
      next_hint: { type: "string", description: "Anticipazione futura in italiano." },
    },
  },
};

const fallbackLesson = {
  intro:
    "Ben tornato nella scuola di magia! Oggi ripassiamo colori e animali in modo super facile.",
  vocaboli: [
    {
      word: "red",
      meaning: "rosso, il colore delle fragole",
      pronunciation: "rèd",
      context: "Quando vedi una mela molto rossa puoi dire che è 'red'.",
    },
    {
      word: "cat",
      meaning: "gatto",
      pronunciation: "kæt",
      context: "Un gatto morbido che fa le fusa si dice 'cat'.",
    },
  ],
  quiz: [
    {
      type: "choice",
      q: "Come si dice 'rosso' in inglese?",
      options: ["Red", "Blue", "Green"],
      answer: "Red",
      hint: "Pensa al colore del semaforo quando bisogna fermarsi.",
      info: "La parola inglese 'red' significa rosso. Ricorda di pronunciarla 'rèd'.",
      pronunciation: "rèd",
    },
    {
      type: "choice",
      q: "Come si dice 'gatto' in inglese?",
      options: ["Dog", "Cat", "Fish"],
      answer: "Cat",
      hint: "È l'animale che fa miao.",
      info: "'Cat' si legge 'kæt' e vuol dire gatto.",
      pronunciation: "kæt",
    },
  ],
  next_hint: "Domani parleremo dei giocattoli preferiti dei maghetti!",
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const safeJsonParse = (payload) => {
  try {
    return JSON.parse(payload);
  } catch (err) {
    console.warn("⚠️ JSON parse fallito:", err.message);
    return null;
  }
};

const stringifyLesson = (lesson = {}) => ({
  intro: lesson.intro?.trim() || fallbackLesson.intro,
  vocaboli: ensureArray(lesson.vocaboli).map((item) => ({
    word: item.word?.trim() || "magic",
    meaning: item.meaning?.trim() || "significato non disponibile",
    pronunciation: item.pronunciation?.trim() || "n.d.",
    context: item.context?.trim() || "Contesto non disponibile ma resta in italiano.",
  })),
  quiz: ensureArray(lesson.quiz).map((item) => ({
    type: item.type === "fill" ? "fill" : "choice",
    q: item.q?.trim() || "Domanda non disponibile",
    options: ensureArray(item.options).slice(0, 4),
    answer: item.answer?.trim() || "",
    hint: item.hint?.trim() || "",
    info: item.info?.trim() || "",
    pronunciation: item.pronunciation?.trim() || "n.d.",
  })),
  next_hint: lesson.next_hint?.trim() || fallbackLesson.next_hint,
});

async function traduciInItaliano(testo) {
  if (!testo) return testo;
  try {
    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Traduci in italiano in modo naturale, semplice e adatto a un bambino di 8 anni. Mantieni i termini inglesi solo come parole da imparare.",
        },
        { role: "user", content: testo },
      ],
    });
    return r.choices[0]?.message?.content?.trim() || testo;
  } catch (err) {
    console.error("❌ Errore traduzione:", err.message);
    return testo;
  }
}

const ensureItalian = async (lesson) => {
  const safeLesson = { ...lesson };

  safeLesson.intro = await traduciInItaliano(safeLesson.intro);
  safeLesson.next_hint = await traduciInItaliano(safeLesson.next_hint);

  safeLesson.vocaboli = await Promise.all(
    ensureArray(safeLesson.vocaboli).map(async (v) => ({
      ...v,
      meaning: await traduciInItaliano(v.meaning),
      context: await traduciInItaliano(v.context),
    }))
  );

  safeLesson.quiz = await Promise.all(
    ensureArray(safeLesson.quiz).map(async (q) => ({
      ...q,
      q: await traduciInItaliano(q.q),
      hint: await traduciInItaliano(q.hint),
      info: await traduciInItaliano(q.info),
      options: await Promise.all(ensureArray(q.options).map(traduciInItaliano)),
    }))
  );

  return safeLesson;
};

router.post("/genera-lezione", async (req, res) => {
  try {
    const {
      materia = "Inglese",
      livello = 1,
      giorno = 1,
      storiaPrecedente = "",
    } = req.body;

    const levelGuard =
      livello <= 3
        ? "Per i livelli 1-3 è vietato scrivere frasi complete in inglese. Usa sempre l'italiano per domande e spiegazioni."
        : "Puoi citare brevi frasi in inglese solo se strettamente necessario e sempre spiegate subito in italiano.";

    const messages = [
      {
        role: "system",
        content: `
Sei Wizzy, un insegnante virtuale per bambini italiani di 7–10 anni.
Parla e scrivi SEMPRE in italiano. Le parole inglesi vanno SEMPRE tra virgolette e spiegate subito.
Output: esclusivamente JSON valido che rispetta lo schema fornito. Non aggiungere testo prima o dopo.
${levelGuard}
        `,
      },
      {
        role: "user",
        content: `
Crea la lezione ${giorno} di ${materia} al livello ${livello}.
La lezione fa parte della storia continua: ${storiaPrecedente || "nessuna lezione precedente"}.

Regole fondamentali:
- Tutte le frasi, spiegazioni e domande devono essere in italiano chiaro e allegro.
- Mantieni coerenza con il livello: più basso = vocaboli semplici, più alto = frasi leggermente più complesse ma sempre comprensibili.
- Ogni vocabolo deve includere pronuncia semplificata e contesto in italiano.
- Ogni domanda del quiz deve indicare la pronuncia della risposta corretta.
- Nessuna frase intera in inglese nei livelli 1-3. Per livelli superiori, solo esempi brevissimi e sempre spiegati.
- Restituisci almeno 5 domande di quiz con opzioni coerenti.
- Rispondi solo con JSON, senza markdown o commenti.
        `,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_schema", json_schema: lessonSchema },
      messages,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "";
    const parsed = safeJsonParse(raw) || fallbackLesson;

    let lesson = stringifyLesson(parsed);
    lesson = await ensureItalian(lesson);

    const sanitized = {
      ...lesson,
      quiz:
        lesson.quiz.length > 0
          ? lesson.quiz
          : fallbackLesson.quiz,
    };

    res.json({
      ok: true,
      materia,
      livello,
      giorno,
      idLezione: `${materia}-${giorno}-${Date.now()}`,
      lezione: sanitized,
    });
  } catch (err) {
    console.error("❌ Errore generazione lezione:", err.message);
    res.status(500).json({
      ok: false,
      error: "Errore nella generazione della lezione",
      lezione: fallbackLesson,
    });
  }
});

export default router;
