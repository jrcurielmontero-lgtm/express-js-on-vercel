import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(cors({ origin: 'https://psicoboost.es' }));
app.use(express.json());

app.options('/api/sendToBrevo', cors()); // Preflight

app.post('/api/sendToBrevo', async (req, res) => {
  console.log("✅ Petición recibida: POST", req.body);

  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res.status(400).send("Faltan campos requeridos");
  }

  // Aquí iría el envío real a Brevo, pero ahora haremos una simulación
  try {
    console.log(`📤 Simulando envío a Brevo de ${nombre} <${email}>`);
    res.status(200).send(`Contacto recibido: ${nombre} (${email})`);
  } catch (err) {
    console.error("❌ Error al enviar:", err);
    res.status(500).send("Error al enviar a Brevo");
  }
});

export default app;
