import fetch from "node-fetch";
import { supabase } from "./LivSupabaseClient.js";

export default async function handler(req, res) {
  console.log("=== TriggerSyncBrevo ejecutado ===");

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" });

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("❌ Falta BREVO_API_KEY");
    return res.status(500).json({ error: "Falta BREVO_API_KEY" });
  }

  try {
    console.log("📡 Consultando contactos en Brevo...");
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      headers: {
        accept: "application/json",
        "api-key": apiKey,
      },
    });

    const data = await response.json();

    if (!data?.contacts) {
      console.error("❌ Respuesta inesperada de Brevo:", data);
      return res.status(500).json({ error: "Respuesta inválida de Brevo" });
    }

    const clientesProcesados = [];

    for (const contacto of data.contacts) {
      const a = contacto.attributes || {};

      const clienteData = {
        email: contacto.email,
        nombre: a.NOMBRE || "",
        apellidos: a.APELLIDOS || "",
        telefono: a.TELEFONO || "",
        tipo_entidad: a.TIPO_ENTIDAD || "",
        num_colegiado: a.NUM_COLEGIADO || "",
        nif: a.NIF || "",
        cif: a.CIF || "",
        ccaa: a.CCAA || "",
        nombre_negocio: a.NOMBRE_NEGOCIO || "",
        web: a.WEB || "",
        plan_interes: a.PLAN_INTERES || "",
        nivel_digital: a.NIVEL_DIGITAL || "",
        objetivo: a.OBJETIVO || "",
        objetivo_detallado: a.OBJETIVO_DETALLADO || "",
        rrss_instagram: a.CUENTA_INSTAGRAM || "",
        rrss_facebook: a.CUENTA_FACEBOOK || "",
        rrss_tiktok: a.CUENTA_TIKTOK || "",
        rrss_youtube: a.CUENTA_YOUTUBE || a.CUENTA_YOTUBE || "",
        rrss_x: a.CUENTA_X || "",
        etapa: a.ETAPA || (a.COMPLETADO_T2 ? "PROPUESTA" : "T1"),
        completado_t2: a.COMPLETADO_T2 || false,
        updated_at: new Date().toISOString(),
      };

      // 🔁 Inserta o actualiza según email
      const { data: upserted, error } = await supabase
        .from("clientes")
        .upsert(clienteData, { onConflict: "email" })
        .select();

      if (error) {
        console.error(`❌ Error sincronizando ${contacto.email}:`, error);
      } else {
        clientesProcesados.push(upserted[0]);
        console.log(`✅ Cliente sincronizado: ${contacto.email}`);
      }
    }

    // 📋 Log en Supabase
    await supabase.from("logs_acciones").insert([
      {
        accion: "sync_brevo",
        detalle: `Sincronizados ${clientesProcesados.length} contactos desde Brevo`,
        fecha: new Date().toISOString(),
      },
    ]);

    return res.status(200).json({
      ok: true,
      sincronizados: clientesProcesados.length,
      fecha: new Date().toISOString(),
    });
  } catch (err) {
    console.error("💥 Error general en TriggerSyncBrevo:", err);
    return res.status(500).json({ error: "Error general", details: err.message });
  }
}
