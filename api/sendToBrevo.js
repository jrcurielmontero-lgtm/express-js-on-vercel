export default async function handler(req, res) {
  // --- CORS setup ---
  res.setHeader("Access-Control-Allow-Origin", "https://psicoboost.es");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // --- OPTIONS preflight ---
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // --- Solo permitir POST ---
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { email, name, phone } = req.body;

    // 🔥 Aquí va tu lógica de Brevo
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        attributes: { FIRSTNAME: name, PHONE: phone },
        updateEnabled: true,
      }),
    });

    const data = await response.json();

    // --- Responder SIEMPRE con headers CORS ---
    res.status(200).json({
      message: "Contacto enviado correctamente a Brevo",
      brevoResponse: data,
    });
  } catch (error) {
    console.error("Error en sendToBrevo:", error);
    // --- Importante: devolver CORS incluso en errores ---
    res
      .status(500)
      .json({ error: "Error al procesar la solicitud", details: error.message });
  }
}
