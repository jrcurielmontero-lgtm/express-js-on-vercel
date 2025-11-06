import fetch from "node-fetch";
import { supabase } from "./LivSupabaseClient.js";

export default async function handler(req, res) {
  console.log("=== SERgenerarContenidoRRSS ejecutado ===");

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const { email, context = "propuesta" } = req.body;

    if (!email) return res.status(400).json({ error: "Falta el email del cliente" });

    // 1️⃣ Recuperar cliente desde Supabase
    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("*")
      .eq("email", email)
      .single();

    if (clienteError || !cliente) {
      console.error("❌ Cliente no encontrado:", email);
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    console.log(`🧠 Generando contenido RRSS para ${context}: ${email}`);

    // 2️⃣ Construir prompt base
    const prompt = `
Genera contenido para redes sociales para un negocio de psicología según estos datos:
Nombre del negocio: ${cliente.nombre_negocio || "N/A"}
Especialidad: ${cliente.especialidad || "N/A"}
Objetivo de marketing: ${cliente.objetivo_detallado || cliente.objetivo || "N/A"}
Nivel digital: ${cliente.nivel_digital || "N/A"}
RRSS activas: Instagram=${cliente.rrss_instagram || "no"}, Facebook=${cliente.rrss_facebook || "no"}, TikTok=${cliente.rrss_tiktok || "no"}, YouTube=${cliente.rrss_youtube || "no"}, X=${cliente.rrss_x || "no"}

Crea un copy atractivo para publicación en redes sociales (máximo 500 caracteres) y una idea de imagen o video breve coherente con el mensaje.
Devuelve en JSON con formato:
{
  "copy": "...",
  "idea_visual": "...",
  "hashtags": ["...", "..."]
}
`;

    // 3️⃣ Llamada a OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("❌ Error GPT:", data.error);
      return res.status(500).json({ error: "Error generando contenido", details: data.error });
    }

    // 4️⃣ Parsear respuesta
    let contenido = {};
    try {
      contenido = JSON.parse(data.choices[0].message.content);
    } catch {
      contenido = { copy: data.choices[0].message.content.trim(), idea_visual: "", hashtags: [] };
    }

    console.log("✅ Contenido generado:", contenido);

    // 5️⃣ Guardar o enviar según contexto
    if (context === "cliente") {
      const { error: insertError } = await supabase.from("contenidos_rrss").insert([
        {
          email_cliente: email,
          copy: contenido.copy,
          idea_visual: contenido.idea_visual,
          hashtags: contenido.hashtags?.join(", "),
          estado: "pendiente_aprobacion",
          fecha_creacion: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error("💥 Error guardando contenido:", insertError);
        return res.status(500).json({ error: "Error guardando contenido", details: insertError.message });
      }
    } else {
      // Enviar solo al gestor si es propuesta
      const gestorEmail = "gestor@psicoboost.es";
      await sendEmailToGestor({ gestorEmail, emailCliente: email, contenido });
    }

    return res.status(200).json({
      ok: true,
      modo: context,
      contenido,
    });
  } catch (err) {
    console.error("💥 Error general en SERgenerarContenidoRRSS:", err);
    return res.status(500).json({ error: "Error interno", details: err.message });
  }
}

// 🧩 Envío al gestor para revisión
async function sendEmailToGestor({ gestorEmail, emailCliente, contenido }) {
  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) return console.error("❌ Falta BREVO_API_KEY");

  const htmlBody = `
    <h3>Nuevo contenido generado (etapa propuesta)</h3>
    <p><strong>Cliente:</strong> ${emailCliente}</p>
    <p><strong>Copy:</strong><br>${contenido.copy}</p>
    <p><strong>Idea Visual:</strong><br>${contenido.idea_visual}</p>
    <p><strong>Hashtags:</strong> ${contenido.hashtags?.join(" ")}</p>
  `;

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": brevoKey,
    },
    body: JSON.stringify({
      sender: { name: "Psicoboost", email: "gestor@psicoboost.es" },
      to: [{ email: gestorEmail }],
      subject: `Contenido RRSS (etapa propuesta) - ${emailCliente}`,
      htmlContent: htmlBody,
    }),
  });
}
