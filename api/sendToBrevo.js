export default function handler(req, res) {
  const ALLOWED_ORIGIN = "https://psicoboost.es";

  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return res.status(200).json({ message: "CORS OK" });
}
