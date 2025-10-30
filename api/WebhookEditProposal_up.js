import fetch from "node-fetch";
import { sendProposalEmail } from "./utilSendProposalEmail.js";

export default async function handler(req, res) {
  console.log("=== WebhookEditProposal_up ejecutado ===");

  // === 1️⃣ Renderizado del formulario HTML (GET) ===
  if (req.method === "GET") {
    const email = req.query.email || "";
    console.log(`📝 Renderizando formulario de edición para: ${email}`);

    return res
      .setHeader("Content-Type", "text/html")
      .status(200)
      .send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Editar Propuesta Psicoboost</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f7fa; padding: 40px; }
          form { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 600px; margin:auto; }
          h2 { color: #2b6cb0; }
          textarea { width: 100%; min-height: 150px; padding: 10px; border-radius: 8px; border: 1px solid #ccc; margin-bottom: 16px; }
          input, button { padding: 10px; border-radius: 8px; border: 1px solid #ccc; width: 100%; }
          button { background-color: #2b6cb0; color: white; border: none; cursor: pointer; margin-top: 10px; }
          button:hover { background-color: #1a4f91; }
        </style>
      </head>
      <body>
        <form method="POST">
          <h2>Editar Propuesta</h2>
          <p>Indica las modificaciones o ajustes que deseas en la propuesta del cliente <b>${email}</b>.</p>
          <input type="hidden" name="email" value="${email}">
          <label>Instrucciones de modificación:</label><br>
          <textarea name="feedback" placeholder="Ej: Añadir servicios de publicidad o adaptar tono más profesional..." required></textarea>
          <button type="submit">Enviar modificación</button>
        </form>
      </body>
      </html>
    `);
  }

  // === 2️⃣ Procesamiento del formulario (POST) ===
  if (req.method === "POST") {
    try {
      const body = await getFormBody(req);
      const email = body.email || "gestor@psicoboost.es";
      const feedback = body.feedback?.trim();

      console.log("📨 Feedback recibido del gestor:", feedback);
      if (!feedback) return res.status(400).send("<h3>Debe especificar cambios</h3>");

      // Prompt para OpenAI
      const prompt = `
El siguiente texto corresponde a una propuesta comercial de Psicoboost.
Aplícale los cambios solicitados por el gestor a continuación, manteniendo un tono corporativo, claro y estructurado.

Feedback del gestor:
"${feedback}"
      `;

      // === Generar nueva propuesta con OpenAI ===
      let newProposal = "(No se pudo generar propuesta)";
      if (process.env.OPENAI_API_KEY) {
        console.log("🧠 Invocando OpenAI para generar propuesta editada...");
        const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "Eres un redactor comercial de Psicoboost. Redacta una nueva versión de la propuesta con base en el feedback del gestor.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 600,
          }),
        });

        const gptData = await gptResponse.json();
        if (gptData.error) {
          console.error("❌ Error de OpenAI:", gptData.error);
        } else {
          newProposal = gptData.choices?.[0]?.message?.content || "(Sin respuesta de GPT)";
        }
      } else {
        console.warn("⚠️ No hay OPENAI_API_KEY configurada, se usará prompt directo.");
        newProposal = prompt;
      }

      // === Enviar la nueva propuesta al gestor ===
      console.log("📤 Enviando nueva propuesta editada a gestor...");
      await sendProposalEmail({
        attrs: { EMAIL: email, NOMBRE: "Cliente (edición)" },
        propuesta: newProposal,
        to: "gestor@psicoboost.es",
        subject: `Propuesta Modificada - ${email}`,
      });

      console.log("✅ Propuesta editada enviada correctamente al gestor.");

      // === Respuesta HTML confirmando envío ===
      return res.status(200).send(`
        <h2>✅ Propuesta modificada enviada correctamente</h2>
        <p>Se ha reenviado la versión actualizada al correo <b>gestor@psicoboost.es</b>.</p>
        <p><a href="/">Volver al panel</a></p>
      `);

    } catch (err) {
      console.error("💥 Error procesando modificación:", err);
      return res.status(500).send(`
        <h3>Error interno procesando la solicitud.</h3>
        <pre>${err.message}</pre>
      `);
    }
  }

  // === 3️⃣ Otros métodos no permitidos ===
  console.warn(`Método no permitido: ${req.method}`);
  return res.status(405).json({ error: "Method Not Allowed" });
}

// === Helper para parsear body del formulario ===
async function getFormBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        const parsed = Object.fromEntries(new URLSearchParams(data));
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}
