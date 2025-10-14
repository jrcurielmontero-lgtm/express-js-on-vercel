import fetch from "node-fetch";

export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    // Llamada a la API de Brevo
    console.log("API Key:", process.env.BREVO_API_KEY);

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY, // Tu API Key segura en Vercel
      },
      body: JSON.stringify({
        email,
        attributes: { NOMBRE: nombre },
        listIds: [2], // Cambia según tu lista
      }),
    });

    const data = await response.json();
    return res.status(200).json({ message: "Contacto enviado correctamente a Brevo", brevoResponse: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al enviar a Brevo", error: error.message });
  }
}
