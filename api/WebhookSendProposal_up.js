export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const body = req.body;
    console.log("Webhook recibido:", body);

    if (body?.contact?.attributes?.COMPLETADO_T2 === true) {
      return res.status(200).json({ success: true, message: "Trigger ejecutado" });
    }

    return res.status(200).json({ success: false, message: "No cumple condición" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
