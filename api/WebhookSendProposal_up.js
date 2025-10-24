import fetch from "node-fetch";

export default async function handler(req, res) {
  console.log("=== WebhookSendProposal_up (Brevo API) ===");

  // Validar método
  if (req.method !== "POST") {
    console.log("Método no permitido:", req.method);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let body;
  try {
    body = req.body;
    console.log("Raw body recibido:", body);
  } catch (err) {
    console.error("Error parseando body:", err);
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (!body?.contact?.attributes) {
    console.error("Faltan atributos del contacto");
    return res.status(400).json({ error: "Missing contact attributes" });
  }

  const attrs = body.contact.attributes;
  console.log("Atributos del contacto:", attrs);

  // Prompt base
  const prompt = `
Propuesta Comercial Psicoboost
------------------------------
Nombre: ${attrs.NOMBRE || "N/A"}
Entidad: ${attrs.TIPO_ENTIDAD || "N/A"}
Número Colegiado: ${attrs.NUM_COLEGIADO || "N/A"}
NIF/CIF: ${attrs.NIF || "N/A"}
Especialidad: ${attrs.ESPECIALIDAD || "N/A"}
CCAA: ${attrs.CCAA || "N/A"}
Nombre negocio: ${attrs.NOMBRE_NEGOCIO || "N/A"}
Web: ${attrs.WEB || "N/A"}
Plan interés: ${attrs.PLAN_INTERES || "N/A"}
Nivel digital: ${attrs.NIVEL_DIGITAL || "N/A"}
Objetivo detallado: ${attrs.OBJETIVO_DETALLADO || "N/A"}
RRSS:
  Instagram: ${attrs.CUENTA_INSTAGRAM || "no"}
  Facebook: ${attrs.CUENTA_FACEBOOK || "no"}
  TikTok: ${attrs.CUENTA_TIKTOK || "no"}
  YouTube: ${attrs.CUENTA_YOTUBE || "no"}
  X: ${attrs.CUENTA_X || "no"}

Servicios incluidos:
  - Gestión RRSS
  - Diseño básico
  - Operativa de marketing
  - SEO básico
  - Informes automáticos
`;

  console.log("Prompt generado:\n", prompt);

  // Generar propuesta vía GPT (si hay API Key)
  let proposalGPT = "";
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log("Invocando OpenAI...");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 400,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error("Error GPT:", data.error);
        proposalGPT = "(Error generando propuesta GPT)";
      } else {
        proposalGPT = data.choices?.[0]?.message?.content || "(Sin respuesta GPT)";
      }
    } catch (err) {
      console.error("Excepción GPT:", err);
      proposalGPT = "(Excepción generando propuesta GPT)";
    }
  } else {
    console.warn("Falta la API key de OpenAI. Se usará prompt como propuesta.");
    proposalGPT = prompt;
  }

  // Envío de correo mediante Brevo API
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("Falta BREVO_API_KEY en variables de entorno");
    }

    console.log("Enviando correo con Brevo...");
    const url = "https://api.brevo.com/v3/smtp/email";
    const bodyEmail = {
      sender: { name: "Psicoboost", email: "gestor@psicoboost.es" },
      to: [{ email: "gestor@psicoboost.es" }],
      subject: `Propuesta Comercial - ${attrs.NOMBRE || "Cliente"}`,
      textContent: proposalGPT,
    };

    const brevoRes = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify(bodyEmail),
    });

    const brevoData = await brevoRes.json();
    if (!brevoRes.ok) {
      console.error("Error Brevo:", brevoData);
      throw new Error(`Fallo Brevo: ${brevoRes.status}`);
    }

    console.log("Correo enviado correctamente con Brevo:", brevoData);
    return res.status(200).json({
      ok: true,
      message: "Correo enviado correctamente con Brevo",
      proposal: proposalGPT,
      brevoResponse: brevoData,
    });

  } catch (err) {
    console.error("Error enviando correo con Brevo:", err);
    return res.status(500).json({ error: "Error enviando correo", details: err.message });
  }
}
