import fetch from "node-fetch";
import { sendProposalEmail } from "./_utils/sendProposalEmail.js";

export default async function handler(req, res) {
  console.log("=== WebhookSendProposal_up ejecutado ===");

  // 1️⃣ Validación de método
  if (req.method !== "POST") {
    console.warn(`Método no permitido: ${req.method}`);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 2️⃣ Validar estructura del contacto
  const attrs = req.body?.contact?.attributes;
  if (!attrs) {
    console.error("❌ Faltan atributos del contacto");
    return res.status(400).json({ error: "Missing contact attributes" });
  }

  console.log("Contacto recibido:", attrs.EMAIL || "sin email");

  // 3️⃣ Prompt base
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
  - Gestión de Redes Sociales
  - Diseño gráfico básico
  - Operativa de marketing
  - SEO básico
  - Informes automatizados
`;

  console.log("🧠 Prompt generado para GPT.");

  // 4️⃣ Generar propuesta vía GPT
  let propuestaFinal = prompt;

  if (process.env.OPENAI_API_KEY) {
    try {
      console.log("Invocando OpenAI...");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: `Redacta una propuesta comercial clara, estructurada y profesional para un cliente de Psicoboost, con el siguiente contexto:\n${prompt}`,
            },
          ],
          max_tokens: 400,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error("❌ Error GPT:", data.error);
        propuestaFinal = "(Error generando propuesta con GPT)";
      } else {
        propuestaFinal = data.choices?.[0]?.message?.content || prompt;
      }
    } catch (err) {
      console.error("💥 Excepción GPT:", err);
      propuestaFinal = "(Excepción generando propuesta GPT)";
    }
  } else {
    console.warn("⚠️ Falta OPENAI_API_KEY. Se usará prompt base.");
  }

  // 5️⃣ Envío de correo con Brevo (delegado a función común)
  try {
    console.log("📧 Enviando correo a gestor@psicoboost.es...");
    const brevoResponse = await sendProposalEmail({
      attrs,
      propuesta: propuestaFinal,
    });

    console.log("✅ Correo enviado correctamente:", brevoResponse.messageId || brevoResponse);

    return res.status(200).json({
      ok: true,
      message: "Correo enviado correctamente con Brevo",
      proposal: propuestaFinal,
      brevoResponse,
    });
  } catch (err) {
    console.error("💥 Error enviando correo:", err);
    return res.status(500).json({
      error: "Error enviando correo con Brevo",
      details: err.message,
    });
  }
}
