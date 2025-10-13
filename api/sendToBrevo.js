// api/sendToBrevo.js
export default async function handler(req, res) {
  const ALLOWED_ORIGIN = "https://psicoboost.es";

  // Headers CORS para todas las respuestas
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responder a la preflight request
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Solo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = req.body;

  // TEST mínimo: no toca Brevo todavía
  console.log("Datos recibidos:", data);
  return res.status(200).json({ message: "Endpoint funciona correctamente", received: data });
}
