import fetch from "node-fetch";

export default async function handler(req, res) {
  console.log("Webhook recibido:", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const contact = req.body.contact;
  if (!contact || !contact.email) {
    console.error("Falta contacto o email:", contact);
    return res.status(400).json({ error: "Falta contacto o email" });
  }

  const prompt = `
  Genera propuesta comercial para psicólogo:
  Nombre: ${contact.attributes?.NOMBRE || "No proporcionado"}
  Plan: ${contact.attributes?.PLAN_INTERES || "No proporcionado"}
  Objetivo: ${contact.attributes?.OBJETIVO_DETALLADO || "No proporcionado"}
  Nivel digital: ${contact.attributes?.NIVEL_DIGITAL || "No proporcionado"}
  Especialidad: ${contact.attributes?.ESPECIALIDAD || "No proporcionado"}
  `;

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY no definida en entorno");
    return res.status(500).json({ error: "Falta la API key de OpenAI" });
  }

  let gptData;
  try {
    console.log("Enviando petición a OpenAI...");
    const gptResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Eres un asistente que genera propuestas comerciales resumidas y claras para psicólogos." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    gptData = await gptResp.json();
    console.log("Respuesta de OpenAI:", gptData);

    if (!gptResp.ok) {
      console.error("Error en OpenAI:", gptData);
      return res.status(500).json({ error: "Error generando propuesta con GPT", details: gptData });
    }

  } catch (e) {
    console.error("Excepción llamando a OpenAI:", e);
    return res.status(500).json({ error: "Excepción al generar propuesta", details: e.message });
  }

  // Aquí enviarías el mail a gestor@psicoboost.es
  console.log("Propuesta generada:", gptData.choices?.[0]?.message?.content);

  return res.status(200).json({
    ok: true,
    message: "Correo enviado correctamente (simulado)",
    proposal: gptData.choices?.[0]?.message?.content
  });
}
