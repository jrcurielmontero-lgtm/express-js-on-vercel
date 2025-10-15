import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { NOMBRE, APELLIDOS, EMAIL, TELEFONO, TIPO_ENTIDAD, ESPECIALIDAD, USO_RRSS, OBJETIVO } = req.body;
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  const atributos = {
    NOMBRE,
    APELLIDOS,
    TELEFONO,
    TIPO_ENTIDAD,
    OBJETIVO,
    ESPECIALIDAD,
    USO_RRSS
  };

  const payload = {
    email: EMAIL,
    attributes: atributos,
    listIds: [3]
  };

  console.log("📬 Payload a Brevo:", payload);

  try {
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
