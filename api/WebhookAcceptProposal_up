import fetch from "node-fetch";

export default async function handler(req, res) {
  console.log("=== WebhookAcceptProposal_up ===");

  if (req.method !== "POST") {
    console.log("Método no permitido:", req.method);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { contact } = req.body;

    if (!contact?.attributes?.EMAIL) {
      console.error("Faltan datos del contacto");
      return res.status(400).json({ error: "Missing contact data" });
    }

    const attrs = contact.attributes;

    const calendlyUrl =
      process.env.CALENDLY_URL ||
      "https://calendly.com/gestor-psicoboost/15min";

    // ✅ Envío del correo con plantilla Brevo
    console.log("Enviando correo con plantilla de Brevo...");

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "Psicoboost", email: "gestor@psicoboost.es" },
        to: [{ email: attrs.EMAIL }],
        templateId: parseInt(process.env.BREVO_TEMPLATE_ACCEPT_ID, 10),
        params: {
          NOMBRE: attrs.NOMBRE || "profesional",
          CALENDLY_URL: calendlyUrl,
        },
      }),
    });

    const data = await brevoRes.json();

    if (!brevoRes.ok) {
      console.error("Error Brevo:", data);
      throw new Error(`Fallo al enviar correo: ${brevoRes.status}`);
    }

    console.log(`Correo de aceptación enviado correctamente a ${attrs.EMAIL}`);
    return res.status(200).json({
      ok: true,
      message: `Correo enviado a ${attrs.EMAIL}`,
      brevoResponse: data,
    });
  } catch (err) {
    console.error("Error general en WebhookAcceptProposal_up:", err);
    return res.status(500).json({ error: err.message });
  }
}
