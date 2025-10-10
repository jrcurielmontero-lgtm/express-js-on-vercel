export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // O restringe al dominio WP
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // resto del código...


// api/sendToBrevo.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const data = req.body;

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        email: data.email,
        attributes: {
          NOMBRE: data.NOMBRE,
          TELEFONO: data.TELEFONO,
          TIPO_ENTIDAD: data.TIPO_ENTIDAD,
          ESPECIALIDAD: data.ESPECIALIDAD,
          USO_RRSS: data.USO_RRSS
        },
        updateEnabled: true
      })
    });

    const result = await response.json();
    res.status(response.status).json(result);
  } catch (error) {
    console.error("Error al enviar a Brevo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
  
}
