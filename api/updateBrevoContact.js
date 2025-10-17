import fetch from "node-fetch";

export default async function handler(req, res) {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");

if (req.method === "OPTIONS") return res.status(204).end();
if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

try {
const {
EMAIL,
TIPO_ENTIDAD,
NUM_COLEGIADO,
NIF,
CIF,
CCAA,
NOMBRE_NEGOCIO,
WEB,
PLAN_INTERES,
NIVEL_DIGITAL,
OBJETIVO_DETALLADO,
LOGO_BASE64,
...rrss
} = req.body;

```
if (!EMAIL) return res.status(400).json({ error: "Falta el email" });

const atributos = {
  TIPO_ENTIDAD,
  NUM_COLEGIADO,
  NIF,
  CIF,
  CCAA,
  NOMBRE_NEGOCIO,
  WEB,
  PLAN_INTERES,
  NIVEL_DIGITAL,
  OBJETIVO_DETALLADO,
  LOGO_URL: LOGO_BASE64 || "",
  COMPLETADO_T2: true,
  ...rrss
};

const payload = { email: EMAIL, attributes: atributos, updateEnabled: true };

const response = await fetch("https://api.brevo.com/v3/contacts", {
  method: "POST",
  headers: {
    "accept": "application/json",
    "content-type": "application/json",
    "api-key": process.env.BREVO_API_KEY
  },
  body: JSON.stringify(payload)
});

const result = await response.json();
if (!response.ok) throw new Error(result.message || "Error en Brevo");

return res.status(200).json({ message: "Contacto actualizado", result });
```

} catch (err) {
console.error("Error updateBrevoContact:", err);
return res.status(500).json({ error: "Error interno", details: err.message });
}
}
