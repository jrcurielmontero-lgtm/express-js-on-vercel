export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    console.log("Webhook recibido:", JSON.stringify(req.body));

    const contact = req.body?.contact;
    const attrs = contact?.attributes || {};

    // Solo actúa si COMPLETADO_T2 = true
    if (attrs.COMPLETADO_T2 === true) {
      console.log(`Trigger válido para: ${contact.email}`);
      // Aquí en el futuro se añadirá la lógica completa
    } else {
      console.log("Webhook ignorado (COMPLETADO_T2 != true)");
    }

    // Respuesta inmediata
    res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
