import fetch from "node-fetch";

/**
 * Envía un correo con Brevo
 * @param {Object} options
 * @param {Object} options.attrs - Atributos del contacto
 * @param {string} options.propuesta - Contenido de la propuesta
 * @param {string} [options.to] - Correo destino (por defecto gestor)
 * @param {string} [options.subject] - Asunto del correo
 */
export async function sendProposalEmail({
  attrs,
  propuesta,
  to = "gestor@psicoboost.es",
  subject,
}) {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error("❌ Falta BREVO_API_KEY");
      throw new Error("Falta BREVO_API_KEY");
    }

    const baseUrl = process.env.BASE_URL || "https://express-js-on-vercel.vercel.app";
    const emailCliente = attrs?.EMAIL || attrs?.email || "gestor@psicoboost.es";
    const emailSubject = subject || `Propuesta Comercial - ${attrs?.NOMBRE || "Cliente"}`;
    const propuestaHTML = typeof propuesta === "string" ? propuesta.replace(/\n/g, "<br>") : "";

    // Evita errores por email undefined
    const emailSafe = encodeURIComponent(emailCliente || "no-email@psicoboost.es");

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color:#2B6CB0;">Propuesta Comercial Psicoboost</h2>
        <p>${propuestaHTML}</p>

        <hr style="margin: 24px 0;">

        <div style="text-align:center;">
          <a href="${baseUrl}/api/WebhookAcceptProposal_up?email=${emailSafe}"
             style="background-color:#38A169;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;margin-right:8px;">
            ✅ Aceptar propuesta
          </a>

          <a href="${baseUrl}/api/WebhookEditProposal_up?email=${emailSafe}"
             style="background-color:#DD6B20;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;">
            ✏️ Editar propuesta
          </a>
        </div>
      </div>
    `;

    const bodyEmail = {
      sender: { name: "Psicoboost", email: "gestor@psicoboost.es" },
      to: [{ email: to }],
      subject: emailSubject,
      htmlContent: htmlBody,
    };

    console.log("📧 Enviando correo vía Brevo a:", bodyEmail.to);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify(bodyEmail),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error Brevo:", data);
      throw new Error(data.message || `Error Brevo (${response.status})`);
    }

    console.log("✅ Correo enviado correctamente a", to);
    return data;
  } catch (err) {
    console.error("💥 Error general en sendProposalEmail:", err);
    throw err;
  }
}
