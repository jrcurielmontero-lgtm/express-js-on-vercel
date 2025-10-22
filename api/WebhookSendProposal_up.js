import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const contact = req.body.contact;
    if (!contact || !contact.email) {
      return res.status(400).json({ error: "Contacto no válido" });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error("Falta la variable de entorno BREVO_API_KEY");
    }

    // 1. Obtener información del contacto desde Brevo
    const brevoRes = await fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(contact.email)}`,
      {
        headers: {
          "accept": "application/json",
          "api-key": apiKey
        }
      }
    );

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      throw new Error(`Error Brevo: ${errText}`);
    }

    const brevoData = await brevoRes.json();

    // 2. Generar prompt (ejemplo simple)
    const prompt = `
      Nombre: ${brevoData.attributes?.FIRSTNAME || "No disponible"}
      Apellidos: ${brevoData.attributes?.LASTNAME || "No disponible"}
      Email: ${brevoData.email}
      Estado: ${brevoData.attributes?.COMPLETADO_T2 ? "Completado T2" : "Pendiente"}
    `;

    // 3. Enviar correo al gestor
    const emailPayload = {
      sender: { name: "Psicoboost", email: "no-reply@psicoboost.es" },
      to: [{ email: "gestor@psicoboost.com" }],
      subject: "Nuevo contacto procesado desde Brevo",
      htmlContent: `<p>Información del contacto:</p><pre>${prompt}</pre>`
    };

    const sendRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify(emailPayload)
    });

    if (!sendRes.ok) {
      const sendErr = await sendRes.text();
      throw new Error(`Error enviando email: ${sendErr}`);
    }

    res.status(200).json({ ok: true, message: "Correo enviado correctamente" });

  } catch (err) {
    console.error("Error en webhook:", err);
    res.status(500).json({ error: err.message });
  }
}
