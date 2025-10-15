import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    // CORS preflight
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const {
    NOMBRE,
    APELLIDOS,
    EMAIL,
    TELEFONO,
    TIPO_ENTIDAD,
    ESPECIALIDAD = [],
    USO_RRSS = [],
    OBJETIVO
  } = req.body;

  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!NOMBRE || !EMAIL) {
    return res.status(400).json({ error: "Faltan campos obligatorios: NOMBRE o EMAIL" });
  }

  // --- Convertir arrays a formato Brevo ['Valor1'|'Valor2'] ---
  const formatMultiple = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return "";
    const escaped = arr.map(v => `'${v}'`); // poner comillas simples a cada valor
    return `[${escaped.join("|")}]`;
  };

  const atributos = {
    NOMBRE,
    APELLIDOS,
    TELEFONO,
    TIPO_ENTIDAD,
    OBJETIVO,
    ESPECIALIDAD: formatMultiple(ESPECIALIDAD),
    USO_RRSS: formatMultiple(USO_RRSS)
  };

  try {
    console.log("📬 Payload a Brevo:", { email: EMAIL, attributes: atributos, listIds: [2] });

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY
      },
      body: JSON.stringify({
        email: EMAIL,
        attributes: atributos,
        listIds: [2]
      })
    });

    const brevoResponse = await response.json();
    console.log("📬 Respuesta de Brevo:", brevoResponse);

    res.status(200).json({
      message: "Contacto enviado correctamente a Brevo",
      brevoResponse
    });

  } catch (error) {
    console.error("🔥 Error en sendToBrevo:", error);
    res.status(500).json({ error: "Error interno en el servidor", details: error.message });
  }
}
