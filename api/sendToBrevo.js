import fetch from "node-fetch";

// Mapa temporal de IPs (solo si lo reactivas luego)
const recentIPs = new Map();

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    // ✅ Leer cuerpo correctamente (Vercel Runtime)
    const body = await req.json();
    const { NOMBRE, APELLIDOS, EMAIL, TELEFONO, TIPO_ENTIDAD, ESPECIALIDAD, USO_RRSS, OBJETIVO } = body;

    if (!EMAIL) {
      return res.status(400).json({ error: "Falta el email" });
    }

    // --- Formateo ---
    const atributos = {
      NOMBRE,
      APELLIDOS,
      TELEFONO,
      TIPO_ENTIDAD,
      OBJETIVO,
      ESPECIALIDAD: Array.isArray(ESPECIALIDAD) ? ESPECIALIDAD.join(", ") : ESPECIALIDAD || "",
      USO_RRSS: Array.isArray(USO_RRSS) ? USO_RRSS.join(", ") : USO_RRSS || ""
    };

    const payload = {
      email: EMAIL,
      attributes: atributos,
      listIds: [2]
    };

    console.log("📬 Payload a Brevo:", payload);

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY
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
