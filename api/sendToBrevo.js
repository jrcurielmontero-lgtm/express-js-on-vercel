// api/sendToBrevo.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  // --- Permitir CORS desde tu dominio ---
  res.setHeader("Access-Control-Allow-Origin", "https://psicoboost.es");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, api-key");

  // Responder preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
          APELLIDOS: data.APELLIDOS,
          TELEFONO: data.TELEFONO,
          TIPO_ENTIDAD: data.TIPO_ENTIDAD,
          ESPECIALIDAD: data.ESPECIALIDAD,
          USO_RRSS: data.USO_RRSS,
          OBJETIVO: data.OBJETIVO
        },
        updateEnabled: true
      })
    });

    const result = await response.json();
    return res.status(response.status).json(result);

  } catch (error) {
    console.error("Error al enviar a Brevo:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
