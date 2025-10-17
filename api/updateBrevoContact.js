import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const body = req.body;
    if (!body.EMAIL) return res.status(400).json({ error: "Email obligatorio" });

    // Atributos Brevo
    const atributos = {
      TIPO_ENTIDAD: body.TIPO_ENTIDAD,
      NIF: body.NIF || "",
      CIF: body.CIF || "",
      NUM_COLEGIADO: body.NUM_COLEGIADO || "",
      CCAA: body.CCAA || "",
      CODIGO_POSTAL: body.CP || "",
      DIRECCION_FISCAL: body.DIRECCION || "",
      RAZON_SOCIAL: body.RAZON_SOCIAL || "",
      NOMBRE_NEGOCIO: body.NOMBRE_NEGOCIO || "",
      WEB: body.WEB || "",
      NIVEL_DIGITAL: body.NIVEL_DIGITAL || "",
      PLAN_INTERES: body.PLAN_INTERES || "",
      OBJETIVO_DETALLADO: body.OBJETIVO_DETALLADO || "",
      COMPLETADO_T2: true
    };

    // Añadir cuentas de RRSS si existen
    Object.keys(body).forEach(k => {
      if (k.startsWith("CUENTA_")) atributos[k] = body[k];
    });

    // Subir logo si se incluye
    if (body.LOGO_BASE64) atributos.LOGO_URL = body.LOGO_BASE64;

    const payload = {
      attributes: atributos,
      email: body.EMAIL,
      updateEnabled: true
    };

    const response = await fetch(`https://api.brevo.com/v3/contacts`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error Brevo");
    res.status(200).json({ message: "Contacto actualizado en Brevo", data });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
}
