// /api/testEnv.js
export default function handler(req, res) {
  // Permitir solo tu dominio o todos con '*'
  res.setHeader("Access-Control-Allow-Origin", "https://psicoboost.es");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end(); // Responder preflight
  }
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  const apiKey = process.env.BREVO_API_KEY;

  console.log("🔍 Verificando variable de entorno BREVO_API_KEY...");
  console.log("📏 Longitud:", apiKey ? apiKey.length : "undefined");
  console.log("🪶 Preview:", apiKey ? apiKey.slice(0, 5) + "..." : "NO_KEY");

  res.json({
    BREVO_API_KEY: apiKey ? "✅ Set" : "❌ Missing",
    preview: apiKey ? apiKey.slice(0, 5) + "..." : "NO_KEY",
  });
});

export default router;
