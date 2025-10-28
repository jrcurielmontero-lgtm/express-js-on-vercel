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
  const emailBody = `
    <h2>Propuesta Comercial</h2>
    <p>Cliente: ${attrs?.NOMBRE || "N/A"}</p>
    <pre style="white-space: pre-wrap;">${propuesta}</pre>
    <br>
    <a href="https://calendly.com/gestor-psicoboost/cita-propuesta"
       style="background-color:#007bff;color:white;padding:10px 16px;border-radius:8px;text-decoration:none;">
       ✅ Aceptar y Agendar Cita
    </a>
  `;

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

  const data = await response.json();

  if (!response.ok) {
    console.error("Error Brevo:", data);
    throw new Error(data.message || "Error enviando correo via Brevo");
  }

  return data;
}
