import fetch from "node-fetch";

export const config = {
  schedule: "0 9,17 * * *", // Ejecuta a las 09:00 y 17:00 UTC
};

export default async function handler(req, res) {
  console.log("=== TriggerProposals ejecutado ===");

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("Falta BREVO_API_KEY");
    return res.status(500).json({ error: "Missing Brevo API key" });
  }

  try {
    // 1️⃣ Obtener contactos con COMPLETADO_T2 = true y ETAPA = "PROPUESTA"
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      headers: {
        accept: "application/json",
        "api-key": apiKey,
      },
    });

    const data = await response.json();
    if (!data?.contacts) {
      console.error("Respuesta inesperada de Brevo:", data);
      return res.status(500).json({ error: "Invalid Brevo response" });
    }

    const candidatos = data.contacts.filter(
      (c) =>
        c.attributes?.COMPLETADO_T2 === true &&
        c.attributes?.ETAPA === "PROPUESTA"
    );

    console.log(`Contactos filtrados: ${candidatos.length}`);

    // 2️⃣ Llamar a tu webhook para cada contacto
    for (const contacto of candidatos) {
      console.log(`Procesando ${contacto.email}...`);

      await fetch(
        `${process.env.BASE_URL || "https://express-js-on-vercel.vercel.app"}/api/WebhookSendProposal_up`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact: contacto }),
        }
      );
    }

    return res.status(200).json({
      ok: true,
      processed: candidatos.length,
    });
  } catch (err) {
    console.error("Error general:", err);
    return res.status(500).json({ error: "Trigger error", details: err });
  }
}
