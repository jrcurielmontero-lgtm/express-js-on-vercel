export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { NOMBRE, EMAIL } = req.body;
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!NOMBRE || !EMAIL) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
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
        email: EMAIL,
        attributes: { NOMBRE },
        listIds: [2]
      })
    });

    const data = await response.json();
    res.status(200).json({ message: "OK", data });
  } catch (err) {
    res.status(500).json({ error: "Error al enviar a Brevo", details: err.message });
  }
}
