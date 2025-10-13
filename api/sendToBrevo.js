// api/sendToBrevo.js
export default async function handler(req, res) {
  const ALLOWED_ORIGIN = "https://psicoboost.es";

  const setCors = () => {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  };

  setCors();

  if (req.method === "OPTIONS") {
    // Devuelve headers CORS aunque sea OPTIONS
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Aquí solo testeo recepción
    console.log("Datos recibidos:", req.body);
    return res.status(200).json({ message: "Endpoint funciona correctamente", received: req.body });
  } catch (error) {
    setCors(); // Headers CORS también en error
    return res.status(500).json({ error: "Error interno" });
  }
}
