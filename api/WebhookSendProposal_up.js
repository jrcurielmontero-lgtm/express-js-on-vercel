import fetch from "node-fetch";

export default async function handler(req, res) {
  console.log("=== WebhookSendProposal_up invoked ===");

  if (req.method !== "POST") {
    console.log("Método no permitido:", req.method);
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // Verificar body
    console.log("Raw body:", req.body);
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    console.log("Parsed body:", body);

    const contact = body.contact;
    if (!contact || !contact.email) {
      console.log("Falta contact.email");
      return res.status(400).json({ error: "Contacto inválido o email vacío" });
    }

    const attr = contact.attributes || {};
    console.log("Atributos del contacto:", attr);

    // Generar prompt para GPT
    const prompt = `
Propuesta Comercial Psicoboost
------------------------------
Nombre: ${attr.NOMBRE || "No disponible"}
Entidad: ${attr.TIPO_ENTIDAD || "No disponible"}
Número Colegiado: ${attr.NUM_COLEGIADO || "No disponible"}
NIF/CIF: ${attr.NIF || attr.CIF || "No disponible"}
Especialidad: ${attr.ESPECIALIDAD || "No disponible"}
CCAA: ${attr.CCAA || "No disponible"}
Nombre negocio: ${attr.NOMBRE_NEGOCIO || "No disponible"}
Web: ${attr.WEB || "No disponible"}
Plan interés: ${attr.PLAN_INTERES || "No disponible"}
Nivel digital: ${attr.NIVEL_DIGITAL || "No disponible"}
Objetivo detallado: ${attr.OBJETIVO_DETALLADO || "No disponible"}
RRSS:
  Instagram: ${attr.CUENTA_INSTAGRAM || "no"}
  Facebook: ${attr.CUENTA_FACEBOOK || "no"}
  TikTok: ${attr.CUENTA_TIKTOK || "no"}
  YouTube: ${attr.CUENTA_YOTUBE || "no"}
  X: ${attr.CUENTA_X || "no"}
Servicios incluidos:
  - Gestión RRSS
  - Diseño básico
  - Operativa de marketing
  - SEO básico
  - Informes automáticos
`;

    console.log("Prompt generado:", prompt);

    // --- Generar propuesta con GPT ---
    if (!process.env.OPENAI_API_KEY) {
      console.log("OPENAI_API_KEY no definida");
      return res.status(500).json({ error: "Falta la API key de OpenAI" });
    }

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

    if (!gptResp.ok) {
      const errText = await gptResp.text();
      console.error("Error GPT:", errText);
      throw new Error("Error generando propuesta con GPT");
    }

    const gptData = await gptResp.json();
    const gptProposal = gptData.choices?.[0]?.message?.content || "No se pudo generar la propuesta";

    console.log("Propuesta generada por GPT:", gptProposal);

    // --- Enviar correo a gestor@psicoboost.es ---
    if (!process.env.BREVO_API_KEY) {
      console.log("BREVO_API_KEY no definida");
      return res.status(500).json({ error: "Falta la API key de Brevo" });
    }

    const emailPayload = {
      sender: { name: "Psicoboost", email: "no-reply@psicoboost.es" },
      to: [{ email: "gestor@psicoboost.es" }],
      subject: `Nueva propuesta de ${attr.NOMBRE || contact.email}`,
      htmlContent: `<p>Se ha generado la siguiente propuesta:</p><pre>${gptProposal}</pre>`
    };

    const sendRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify(emailPayload)
    });

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      console.error("Error enviando email a Brevo:", errText);
      throw new Error(`Error enviando email: ${errText}`);
    }

    console.log("Correo enviado correctamente a gestor@psicoboost.es");
    res.status(200).json({ ok: true, message: "Correo con propuesta enviado correctamente" });

  } catch (err) {
    console.error("Error general:", err);
    res.status(500).json({ error: err.message });
  }
}
