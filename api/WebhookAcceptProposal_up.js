import fetch from "node-fetch";

export default async function handler(req, res) {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Missing email" });

  const calendlyUrl =
    process.env.CALENDLY_URL ||
    "https://calendly.com/gestor-psicoboost/valoracion-propuesta";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
      <h2 style="color:#2B6CB0;">Tu propuesta ha sido aceptada 🎉</h2>
      <p>Hola,</p>
      <p>Nos alegra informarte que tu propuesta ha sido aprobada. 
      Por favor, agenda una reunión con nosotros para comentarla:</p>
      <p style="text-align:center;">
        <a href="${calendlyUrl}" 
           style="background-color:#2B6CB0;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;">
           📅 Agendar cita
        </a>
      </p>
    </div>
  `;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "Psicoboost", email: "gestor@psicoboost.es" },
      to: [{ email }],
      subject: "Agenda tu cita con Psicoboost",
      htmlContent: html,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("❌ Error enviando correo de cita:", data);
    return res.status(500).json({ error: "Error enviando correo de cita" });
  }

  return res.status(200).json({ ok: true });
}
