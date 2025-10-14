import fetch from "node-fetch";

export default async function handler(req, res) {
  // --- CABECERAS CORS COMUNES ---
  res.setHeader("Access-Control-Allow-Origin", "https://psicoboost.es"); // Cambia por tu dominio
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  console.log("✅ Petición recibida:", req.method, req.body);

  // Preflight CORS
  if (req.method === "OPTIONS") {
    console.log("⚡ Preflight OPTIONS recibido");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    console.warn("⚠️ Método no permitido:", req.method);
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { nombre, email } = req.body;
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  console.log("🔑 API Key length:", BREVO_API_KEY ? BREVO_API_KEY.length : "undefined");
  console.log("🔑 API Key preview:", BREVO_API_KEY ? BREVO_API_KEY.slice(0, 5) + "..." : "NO_KEY");

  if (!nombre || !email) {
    console.warn("⚠️ Faltan campos en body:", req.body);
    return res.status(400).json({ error: "Faltan campos obligatorios: nombre y email" });
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY
      },
      body: JSON.stringify({
        email,
        attributes: { NOMBRE: nombre },
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
