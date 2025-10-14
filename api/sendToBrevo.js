import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: 'https://psicoboost.es' }));
app.use(express.json());

app.options('/api/sendToBrevo', cors());

app.post('/api/sendToBrevo', async (req, res) => {
  console.log("✅ Petición recibida: POST", req.body);
  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }

  try {
    const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email,
        attributes: { NOMBRE: nombre },
        listIds: [2] // cambia por el ID real de tu lista en Brevo
      })
    });

    const result = await brevoResponse.json();

    if (!brevoResponse.ok) {
      console.error("❌ Error de Brevo:", result);
      return res.status(500).json({ message: "Error en Brevo", brevoResponse: result });
    }

    console.log("📤 Contacto enviado a Brevo:", result);
    res.status(200).json({ message: "Contacto enviado correctamente a Brevo", brevoResponse: result });

  } catch (error) {
    console.error("💥 Error al conectar con Brevo:", error);
    res.status(500).json({ message: "Error al conectar con Brevo", error: error.message });
  }
});

export default app;
