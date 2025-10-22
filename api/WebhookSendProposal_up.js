import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const contact = body.contact;
    if (!contact || !contact.email) return res.status(400).json({ error: "Contacto no válido" });

    // Extraer atributos de Form1/Form2
    const attr = contact.attributes || {};
    
    const prompt = `
Propuesta Comercial Psicoboost
------------------------------
Nombre: ${attr.NOMBRE || "No disponible"}
Entidad: ${attr.TIPO_ENTIDAD || "No disponible"}
Número Colegiado: ${attr.NUM_COLEGIADO || "No disponible"}
NIF/CIF: ${attr.NIF || attr.CIF || "No disponible"}
Especialidad: ${attr.ESPECIALIDAD || "No disponible"}
CCAA: ${attr.CCAA || "No disponible"}
Nombre negocio: ${attr.NOMBRE_NEGOCIO || "No disponible"}
Web: ${attr.WEB || "No disponible"}
Plan interés: ${attr.PLAN_INTERES || "No disponible"}
Nivel digital: ${attr.NIVEL_DIGITAL || "No disponible"}
Objetivo detallado: ${attr.OBJETIVO_DETALLADO || "No disponible"}
RRSS:
  Instagram: ${attr.CUENTA_INSTAGRAM || "no"}
  Facebook: ${attr.CUENTA_FACEBOOK || "no"}
  TikTok: ${attr.CUENTA_TIKTOK || "no"}
  YouTube: ${attr.CUENTA_YOTUBE || "no"}
  X: ${attr.CUENTA_X || "no"}
Servicios incluidos:
  - Gestión RRSS
  - Diseño básico
  - Operativa de marketing
  - SEO básico
  - Informes automáticos
`;

    // Enviar email a gestor@psicoboost.es vía Brevo
    const emailPayload = {
      sender: { name: "Psicoboost", email: "no-reply@psicoboost.es" },
      to: [{ email: "gestor@psicoboost.es" }],
      subject: `Nueva propuesta de ${attr.NOMBRE || contact.email}`,
      htmlContent: `<p>Se ha generado la siguiente propuesta:</p><pre>${prompt}</pre>`
    };

    const sendRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify(emailPayload)
    });

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      throw new Error(`Error enviando email: ${errText}`);
    }

    res.status(200).json({ ok: true, message: "Correo con prompt enviado correctamente" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
