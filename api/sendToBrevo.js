import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "https://psicoboost.es",
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

app.options("/api/sendToBrevo", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://psicoboost.es");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return res.status(204).end();
});

app.post("/api/sendToBrevo", async (req, res) => {
  console.log("✅ Petición recibida:", req.body);

  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        attributes: { NOMBRE: nombre },
        listIds: [2], // Cambia este ID según tu lista en Brevo
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Error de Brevo:", result);
      return res
        .status(500)
        .json({ message: "Error al enviar a Brevo", brevoResponse: result });
    }

    console.log("📤 Contacto enviado a Brevo:", result);
    res.status(200).json({
      message: "Contacto enviado correctamente a Brevo",
      brevoResponse: result,
    });
  } catch (error) {
    console.error("💥 Error general:", error);
    res.status(500).json({ message: "Error general", error: error.message });
  }
});

export default app;
