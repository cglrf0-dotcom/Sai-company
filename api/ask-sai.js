export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { question } = req.body || {};
    const q = typeof question === "string" ? question.trim() : "";

    if (!q) {
      return res.status(400).json({
        error: "Escribe una pregunta."
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY no está configurada en Vercel."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          instructions:
            "Eres SAI, el asistente inteligente de SAI Company. Responde con claridad, precisión y utilidad. Si el usuario escribe en español, responde en español.",
          input: q,
          max_output_tokens: 800
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "Error de OpenAI."
      });
    }

    return res.status(200).json({
      answer:
        data.output_text ||
        "SAI no pudo generar una respuesta."
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: "Error interno del servidor."
    });
  }
}
