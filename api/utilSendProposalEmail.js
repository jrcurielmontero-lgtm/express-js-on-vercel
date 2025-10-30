import fetch from "node-fetch";

/**
 * Envía un correo con Brevo con propuesta y botones de acción
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
      throw new Error("❌ Falta BREVO_API_KEY");
    }

    const baseUrl =
      process.env.BASE_URL ||
      "https://express-js-on-vercel-41rtigi95-ramons-projects-623fdeed.vercel.app";

    const emailCliente = attrs?.EMAIL || attrs?.email || "gestor@psicoboost.es";
    const emailSubject =
      subject || `Propuesta Comercial - ${attrs?.NOMBRE || "Cliente"}`;

    const propuestaHTML = (typeof propuesta === "string" ? propuesta : "")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;")
  .replace(/\n/g, "<br>");


    const emailSafe = encodeURIComponent(emailCliente);

    // === HTML del correo ===
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color:#2B6CB0; text-align:center;">Propuesta Comercial Psicoboost</h2>
        <p>${propuestaHTML}</p>

        <hr style="margin: 24px 0;">

        <div style="text-align:center;">
          <a href="${baseUrl}/api/WebhookAcceptProposal_up?email=${emailSafe}"
             style="background-color:#38A169;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px;font-weight:bold;margin-right:10px;">
            ✅ Aceptar propuesta
          </a>

          <a href="${baseUrl}/api/WebhookEditProposal_up?email=${emailSafe}"
             style="background-color:#DD6B20;color:#fff;padding:12px 20px;text-decoration:none;border-radius:8px;font-weight:bold;">
            ✏️ Editar propuesta
          </a>
        </div>

        <hr style="margin: 24px 0;">
        <footer style="text-align:center; font-size: 13px; color: #777;">
          © Psicoboost · <a href="https://www.psicoboost.es" style="color:#2B6CB0;">www.psicoboost.es</a>
        </footer>
      </div>
    `;

    // === Estructura del email ===
    const bodyEmail = {
      sender: { name: "Psicoboost", email: "gestor@psicoboost.es" },
      to: [{ email: to }],
      subject: emailSubject,
      htmlContent: htmlBody, // 👈 IMPORTANTE: esto genera el HTML
    };

    console.log("📧 Enviando correo a:", to);

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
