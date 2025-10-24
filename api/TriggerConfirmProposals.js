import fetch from "node-fetch";

export default async function handler(req, res) {
  console.log("=== TriggerConfirmProposals ejecutado ===");
  console.log("Hora UTC actual:", new Date().toISOString());
 
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("Falta BREVO_API_KEY");
    return res.status(500).json({ error: "Missing Brevo API key" });
  }

  try {
    // 1️⃣ Obtener contactos
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      headers: {
        accept: "application/json",
        "api-key": apiKey,
      },
    });

    const data = await response.json();
    console.log("Respuesta de Brevo:", JSON.stringify(data, null, 2));

    if (!data?.contacts) {
      console.error("Respuesta inesperada de Brevo:", data);
      return res.status(500).json({ error: "Invalid Brevo response" });
    }

    const candidatos = data.contacts.filter(
      (c) =>
        c.attributes?.COMPLETADO_T2 === true &&
        c.attributes?.ETAPA === "PROPUESTA"
    );

    console.log(`Contactos filtrados para propuesta: ${candidatos.length}`);

    // 2️⃣ Llamar a tu webhook para cada contacto
    for (const contacto of candidatos) {
      console.log(`Procesando ${contacto.email}...`);

      const webhookUrl =
        process.env.BASE_URL ||
        "https://express-js-on-vercel.vercel.app/api/WebhookSendProposal_up";

      try {
        const resp = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact: contacto }),
        });

        const result = await resp.json();
        console.log(`Webhook respuesta para ${contacto.email}:`, result);
      } catch (err) {
        console.error(`Error llamando webhook para ${contacto.email}:`, err);
      }
    }

    return res.status(200).json({
      ok: true,
      processed: candidatos.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error general:", err);
    return res.status(500).json({ error: "Trigger error", details: err });
  }
}
