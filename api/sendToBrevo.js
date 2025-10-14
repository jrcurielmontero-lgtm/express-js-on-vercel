import fetch from "node-fetch";

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { NOMBRE, APELLIDOS, EMAIL, TELEFONO, TIPO_ENTIDAD, ESPECIALIDAD, USO_RRSS, OBJETIVO } = req.body;
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!EMAIL || !NOMBRE) {
    return res.status(400).json({ error: "Faltan campos obligatorios: EMAIL o NOMBRE" });
  }

  try {
    const payload = {
      email: EMAIL,
      attributes: {
        NOMBRE,
        APELLIDOS,
       // TELEFONO,
       // TIPO_ENTIDAD,
       // ESPECIALIDAD: Array.isArray(ESPECIALIDAD) ? ESPECIALIDAD.join(", ") : ESPECIALIDAD,
       // USO_RRSS: Array.isArray(USO_RRSS) ? USO_RRSS.join(", ") : USO_RRSS,
        OBJETIVO
      },
      listIds: [2] // tu lista de Brevo
    };

    console.log("📬 Payload a Brevo:", payload);

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const brevoResponse = await response.json();
    console.log("📬 Respuesta de Brevo:", brevoResponse);

    res.status(200).json({ message: "Contacto enviado correctamente a Brevo", brevoResponse });
  } catch (error) {
    console.error("🔥 Error en sendToBrevo:", error);
    res.status(500).json({ error: "Error interno en el servidor", details: error.message });
  }
}
