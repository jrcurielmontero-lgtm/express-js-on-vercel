  import fetch from "node-fetch";
  
  /**
   * Envia un correo con Brevo
   * @param {Object} options
   * @param {Object} options.attrs - Atributos del contacto
   * @param {string} options.propuesta - Contenido de la propuesta
   * @param {string} [options.to] - Correo destino
   * @param {string} [options.subject] - Asunto del correo
   */
  export async function sendProposalEmail({ attrs, propuesta, to = "gestor@psicoboost.es", subject }) {
    if (!process.env.BREVO_API_KEY) throw new Error("Falta BREVO_API_KEY");
  
    const emailSubject = subject || `Propuesta Comercial - ${attrs?.NOMBRE || "Cliente"}`;
   const bodyEmail = {
    sender: { name: "Psicoboost", email: "gestor@psicoboost.es" },
    to: [{ email: attrs.EMAIL || attrs.email || attrs?.contact_email || "gestor@psicoboost.es" }],
    subject: `Propuesta Comercial - ${attrs.NOMBRE || "Cliente"}`,
    textContent: propuesta,
  };
  
  
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "Psicoboost", email: "no-reply@psicoboost.es" },
        to: [{ email: to }],
        subject: emailSubject,
        htmlContent: emailBody,
      }),
    });
  console.log("📧 Enviando correo a:", bodyEmail.to);

    const data = await response.json();
  
    if (!response.ok) {
      console.error("Error Brevo:", data);
      throw new Error(data.message || "Error enviando correo via Brevo");
    }
  
    return data;
  }
