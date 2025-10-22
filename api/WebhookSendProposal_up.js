import fetch from "node-fetch";
import { config } from "dotenv";
config(); // carga variables de entorno desde .env.local en local

export default async function handler(req, res) {
  console.info("=== WebhookSendProposal_up invoked ===");

  // Validar método POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  let body;
  try {
    body = req.body;
    console.info("Raw body:", body);
  } catch (err) {
    console.error("Error parseando JSON:", err);
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (!body.contact || !body.contact.attributes) {
    return res.status(400).json({ error: "Faltan datos de contacto" });
  }

  const attrs = body.contact.attributes;
  console.info("Atributos del contacto:", attrs);

  // Generar prompt/propuesta
  const prompt = `
Propuesta Comercial Psicoboost
------------------------------
Nombre: ${attrs.NOMBRE}
Entidad: ${attrs.TIPO_ENTIDAD || "no"}
Número Colegiado: ${attrs.NUM_COLEGIADO || "no"}
NIF/CIF: ${attrs.NIF || attrs.CIF || "no"}
Especialidad: ${attrs.ESPECIALIDAD || "no"}
CCAA: ${attrs.CCAA || "no"}
Nombre negocio: ${attrs.NOMBRE_NEGOCIO || "no"}
Web: ${attrs.WEB || "no"}
Plan interés: ${attrs.PLAN_INTERES || "no"}
Nivel digital: ${attrs.NIVEL_DIGITAL || "no"}
Objetivo detallado: ${attrs.OBJETIVO_DETALLADO || "no"}
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
  console.info("Prompt generado:", prompt);

  // Llamada a GPT
  let gptResponseText = "";
  if (!process.env.OPENAI_API_KEY) {
    console.warn("No hay API Key de OpenAI. Se usa mock de propuesta.");
    gptResponseText = `Propuesta Comercial para ${attrs.NOMBRE}, Psicólogo Clínico:\n\nPlan ${attrs.PLAN_INTERES || "Básico"} para Potenciar tu Presencia Online y Captar Más Pacientes:\n\n- Desarrollo de Estrategia Digital Personalizada.\n- Creación de Contenidos de Calidad para Redes Sociales.\n- Optimización de Perfil en Directorios de Salud Online.\n- Asesoramiento en Publicidad Online.\n- Seguimiento de Resultados y Ajustes Constantes.\n\n¡Potencia tu presencia online y expande tu alcance!`;
  } else {
    try {
      const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      });
      const openaiData = await openaiResp.json();
      console.info("Respuesta de GPT:", openaiData);
      gptResponseText = openaiData?.choices?.[0]?.message?.content || "[Sin respuesta de GPT]";
    } catch (err) {
      console.error("Error GPT:", err);
      return res.status(500).json({ error: "Error generando propuesta con GPT", details: err });
    }
  }

  // Enviar correo real a Brevo
  if (!process.env.BREVO_API_KEY) {
    console.warn("No hay API Key de Brevo. Email simulado.");
    return res.status(200).json({ ok: true, message: "Correo enviado correctamente (simulado)", proposal: gptResponseText });
  }

  try {
    const emailResp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Psicoboost", email: "no-reply@psicoboost.es" },
        to: [{ email: "gestor@psicoboost.es" }],
        subject: `Propuesta Comercial - ${attrs.NOMBRE}`,
        htmlContent: `<pre>${gptResponseText}</pre>`
      })
    });
    const emailResult = await emailResp.json();
    console.info("Resultado envío Brevo:", emailResult);
    return res.status(200).json({ ok: true, message: "Correo enviado correctamente", proposal: gptResponseText, emailResult });
  } catch (err) {
    console.error("Error enviando correo a Brevo:", err);
    return res.status(500).json({ error: "Error enviando correo", details: err });
  }
}
