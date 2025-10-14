import fetch from "node-fetch";

export default async function handler(req, res) {
  console.log("✅ Petición recibida:", req.method, req.body);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { nombre, email } = req.body;
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  console.log("🔑 API Key length:", BREVO_API_KEY ? BREVO_API_KEY.length : "undefined");
  console.log("🔑 API Key preview:", BREVO_API_KEY ? BREVO_API_KEY.slice(0, 5) + "..." : "NO_KEY");

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
