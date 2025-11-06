// /api/generarContenidoRRSS.js
import OpenAI from "openai";
import { supabase } from "../lib/supabaseClient.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const { email, context = "propuesta", prompt } = req.body;
    if (!email) return res.status(400).json({ error: "Falta el email del cliente" });

    // 1️⃣ Buscar cliente
    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("*")
      .eq("email", email)
      .single();

    if (clienteError || !cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // 2️⃣ Generar prompt base contextual
    const promptBase = prompt || `
Genera contenido para redes sociales orientado a ${context === "propuesta"
        ? "mostrar el valor de la propuesta de marketing"
        : "mantener y mejorar la presencia digital del cliente activo"}.
Datos:
- Tipo de entidad: ${cliente.tipo_entidad || "no especificado"}
- Objetivo: ${cliente.objetivo_detallado || cliente.objetivo || "no especificado"}
- Nivel digital: ${cliente.nivel_digital || "no especificado"}
- Plan: ${cliente.plan_interes || "no definido"}

Devuelve un texto breve (copy) y una descripción de imagen o video complementaria.
`;

    // 3️⃣ Llamar a OpenAI para generar el contenido
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: promptBase }],
      max_tokens: 300
    });

    const contenidoGenerado = completion.choices[0].message.content.trim();

    // 4️⃣ Guardar en tabla prompts
    await supabase.from("prompts").insert([
      {
        cliente_id: cliente.id,
        tipo: "contenido_rrss",
        prompt_base: promptBase,
        prompt_editado: null
      }
    ]);

    // 5️⃣ Guardar contenido generado en contenidos_rrss
    const { data: contenido, error: insertError } = await supabase
      .from("contenidos_rrss")
      .insert([
        {
          cliente_id: cliente.id,
          etapa: context === "propuesta" ? "PROPUESTA" : "CLIENTE",
          tipo: "texto",
          plataforma: "instagram",
          contenido_texto: contenidoGenerado,
          estado_autorizacion: context === "propuesta" ? "aprobado" : "pendiente"
        }
      ])
      .select();

    if (insertError) throw insertError;

    // 6️⃣ Log de acción
    await supabase.from("logs_acciones").insert([
      {
        cliente_id: cliente.id,
        email,
        accion: "generar_contenido_rrss",
        detalle: `Contexto: ${context}`
      }
    ]);

    return res.status(200).json({
      ok: true,
      message: "Contenido generado correctamente",
      context,
      contenido: contenidoGenerado,
      registro: contenido
    });
  } catch (error) {
    console.error("Error generarContenidoRRSS:", error);
    return res.status(500).json({ error: error.message });
  }
}
