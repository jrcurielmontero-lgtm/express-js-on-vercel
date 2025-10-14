import fetch from "node-fetch";

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*"); // permite cualquier dominio
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end(); // Preflight
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { nombre, email } = req.body;
  const BREVO_API_KEY = process.env.BREVO_API_KEY; // ⚠️ Guardar en Environment Variables de Vercel

  if (!nombre || !email) {
    return res.status(400).json({ error: "Faltan campos: nombre y email" });
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY
      },
      body: JSON.stringify({ email, attributes: { NOMBRE: nombre }, listIds: [2] })
    });

    const brevoResponse = await response.json();
    res.status(200).json({ message: "Contacto enviado correctamente a Brevo", brevoResponse });

  } catch (err) {
    res.status(500).json({ error: "Error interno", details: err.message });
  }
}
