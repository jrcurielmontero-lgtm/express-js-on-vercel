import fetch from "node-fetch";

export const config = {
  api: { bodyParser: { sizeLimit: "5mb" } } // permite logo base64
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const {
      EMAIL,
      NOMBRE,
      APELLIDOS,
      TIPO_ENTIDAD,
      NUM_COLEGIADO,
      NIF,
      CIF,
      CCAA,
      CP,
      DIRECCION,
      RAZON_SOCIAL,
      CUENTAS_RRSS,
      LOGO_BASE64
    } = req.body;

    if (!EMAIL) return res.status(400).json({ error: "Falta el email" });

    const atributos = {
      NOMBRE,
      APELLIDOS,
      TIPO_ENTIDAD,
      NUM_COLEGIADO,
      NIF,
      CIF,
      CCAA,
      CP,
      DIRECCION,
      RAZON_SOCIAL,
      CUENTAS_RRSS: Array.isArray(CUENTAS_RRSS) ? CUENTAS_RRSS.join(", ") : CUENTAS_RRSS || "",
      LOGO_BASE64: LOGO_BASE64 || ""
    };

    const payload = { attributes: atributos, emailBlacklisted: false };

    const response = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(EMAIL)}`, {
      method: "PUT",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const brevoResponse = await response.json();
    console.log("🧾 Actualización Brevo:", brevoResponse);

    if (response.status >= 400)
      return res.status(response.status).json({ error: "Error al actualizar", details: brevoResponse });

    res.status(200).json({ message: "Contacto actualizado correctamente", brevoResponse });
  } catch (err) {
    console.error("🔥 Error interno:", err);
    res.status(500).json({ error: "Error interno del servidor", details: err.message });
  }
}
