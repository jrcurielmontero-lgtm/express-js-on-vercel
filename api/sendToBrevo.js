// api/sendToBrevo.js
export default async function handler(req, res) {
  const ALLOWED_ORIGIN = "https://psicoboost.es";

  // --- CORS ---
  const setCorsHeaders = () => {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, api-key");
  };

  setCorsHeaders();

  // Manejar preflight
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
        email: data.EMAIL,
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

    // Siempre setear CORS antes de responder
    setCorsHeaders();
    res.status(response.status).json(result);

  } catch (error) {
    console.error("Error al enviar a Brevo:", error);
    setCorsHeaders();
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
