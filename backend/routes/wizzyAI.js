import express from "express";
import OpenAI from "openai";
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/ask", async (req, res) => {
  try {
    const { message, context } = req.body;

    // Filtro rapido lato server
    const banned = /(violenza|arma|morte|odio|religione|politica)/i;
    if (banned.test(message)) {
      return res.json({
        reply: "Eh-eh, Wizzy non parla di queste cose! Parliamo di qualcosa di magico! 🪄",
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Sei Wizzy, un maghetto allegro e saggio per bambini di 6-10 anni.
          Usa tono positivo, educativo e semplice.`,
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("❌ Errore AI:", err);
    res.status(500).json({
      reply: "Oh-oh! La magia si è un po' incantata. Riproviamo tra poco! ✨",
    });
  }
});

export default router;
