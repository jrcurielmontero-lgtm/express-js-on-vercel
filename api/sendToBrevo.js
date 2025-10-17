import fetch from "node-fetch";

// Mapa temporal para limitar envíos por IP (reinicia al redeploy)
const recentIPs = new Map();

export default async function handler(req, res) {
  // --- CORS headers ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

 // const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
 // const now = Date.now();

  // 🔒 Bloqueo: 24 horas = 86.400.000 ms
  //if (recentIPs.has(ip) && now - recentIPs.get(ip) < 86400000) {
  //  return res.status(429).json({ error: "Ya se envió un formulario desde esta IP en las últimas 24h" });
 // }

  // Guardamos la IP
 // recentIPs.set(ip, now);

  try {
    const { NOMBRE, APELLIDOS, EMAIL, TELEFONO, TIPO_ENTIDAD, ESPECIALIDAD, USO_RRSS, OBJETIVO } = req.body;

  //  if (!NOMBRE || !EMAIL) {
  //    return res.status(400).json({ error: "Campos obligatorios faltantes" });
//}

    // 🧠 Convertimos los checkboxes en texto separados por comas (para Brevo tipo texto)
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
