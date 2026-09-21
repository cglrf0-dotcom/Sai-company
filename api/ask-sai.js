export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question } = req.body || {};
    const q = typeof question === "string" ? question.trim() : "";

    if (!q) {
      return res.status(400).json({
        error: "Escribe una pregunta."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY no está configurada."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          input: [
            {
              role: "system",
              content:
                "Eres SAI, el asistente inteligente de SAI Company. Responde con claridad, precisión y utilidad. Si el usuario escribe en español, responde en español."
            },
            {
              role: "user",
              content: q
            }
          ],
          max_output_tokens: 800
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(502).json({
        error: "No se pudo obtener una respuesta de SAI."
      });
    }

    return res.status(200).json({
      answer: data.output_text || "SAI no pudo generar una respuesta."
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error interno del servidor."
    });
  }
      }
