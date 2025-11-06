// /lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validación preventiva
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Faltan variables de entorno de Supabase");
  throw new Error("Variables de entorno no configuradas para Supabase");
}

// 🔗 Cliente con permisos de servicio (backend)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
