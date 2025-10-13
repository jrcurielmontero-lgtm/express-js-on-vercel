// api/sendToBrevo.js
export default async function handler(req, res) {
  const ALLOWED_ORIGIN = "https://psicoboost.es";

  // --- Headers CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end(); // preflight

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const data = req.body;

  // Validaciones mínimas
  if (!data.EMAIL || !data.NOMBRE) return res.status(400).json({ error: "Faltan campos obligatorios" });

  try {
    const apiKey = process.env.BREVO_API_KEY;

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
          APELLIDOS: data.APELLIDOS || "",
          TELEFONO: data.TELEFONO || "",
          TIPO_ENTIDAD: data.TIPO_ENTIDAD || "",
          ESPECIALIDAD: Array.isArray(data.ESPECIALIDAD) ? data.ESPECIALIDAD.join(", ") : "",
          USO_RRSS: Array.isArray(data.USO_RRSS) ? data.USO_RRSS.join(", ") : "",
          OBJETIVO: data.OBJETIVO || ""
        },
        updateEnabled: true
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: result.message || "Error al enviar a Brevo" });
    }

    return res.status(200).json({ message: "¡Gracias! Hemos recibido tus datos correctamente." });

  } catch (error) {
    console.error("Error interno:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
