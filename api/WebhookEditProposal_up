import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // === Renderiza el formulario HTML ===
    const email = req.query.email || "";
    return res.setHeader("Content-Type", "text/html").status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Editar Propuesta Psicoboost</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f7f8fa; color: #333; padding: 40px; }
          form { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 600px; margin:auto; }
          h2 { color: #007bff; }
          textarea { width: 100%; min-height: 150px; padding: 10px; border-radius: 8px; border: 1px solid #ccc; }
          input, button { padding: 10px; margin-top: 10px; border-radius: 8px; border: 1px solid #ccc; width: 100%; }
          button { background-color: #007bff; color: white; border: none; cursor: pointer; }
          button:hover { background-color: #0056b3; }
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

  // === Procesa el envío del formulario ===
  if (req.method === "POST") {
    try {
      const body = await getFormBody(req);
      const email = body.email || "gestor@psicoboost.es";
      const feedback = body.feedback || "";

      console.log("Feedback recibido:", feedback);

      // Prompt base para GPT
      const prompt = `
El siguiente texto es una propuesta comercial previa. 
Aplícale los cambios solicitados por el gestor.

Feedback del gestor:
"${feedback}"

Genera una versión actualizada y mejorada, manteniendo tono corporativo y formato estructurado.
      `;

      // Llamada a OpenAI
      let newProposal = "(Falta API key)";
      if (process.env.OPENAI_API_KEY) {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
          }),
        });
        const data = await response.json();
        newProposal = data.choices?.[0]?.message?.content || "(Sin respuesta de GPT)";
      }

      // Enviar correo al gestor
      const emailBody = {
        sender: { name: "Psicoboost", email: "gestor@psicoboost.es" },
        to: [{ email: "gestor@psicoboost.es" }],
        subject: `Propuesta modificada - ${email}`,
        htmlContent: `
          <h2>Propuesta Comercial Actualizada</h2>
          <pre style="white-space: pre-wrap;">${newProposal}</pre>
          <br>
          <div style="margin-top: 20px;">
            <a href="https://calendly.com/gestor-psicoboost/cita-propuesta" 
              style="background-color:#007bff;color:white;padding:10px 16px;border-radius:8px;text-decoration:none;">
              ✅ Aceptar y Agendar Cita
            </a>
          </div>
        `,
      };

      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify(emailBody),
      });

      const brevoData = await brevoRes.json();
      console.log("Respuesta Brevo:", brevoData);

      // Respuesta HTML al usuario
      return res.status(200).send(`
        <h2>✅ Propuesta modificada enviada correctamente</h2>
        <p>Se ha reenviado la nueva versión al correo <b>gestor@psicoboost.es</b>.</p>
      `);

    } catch (err) {
      console.error("Error procesando modificación:", err);
      return res.status(500).send("<h3>Error interno procesando la solicitud</h3>");
    }
  }

  // Otros métodos no permitidos
  return res.status(405).json({ error: "Method Not Allowed" });
}

// Helper para parsear body del formulario (x-www-form-urlencoded)
async function getFormBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => data += chunk);
    req.on("end", () => {
      const parsed = Object.fromEntries(new URLSearchParams(data));
      resolve(parsed);
    });
    req.on("error", reject);
  });
}
