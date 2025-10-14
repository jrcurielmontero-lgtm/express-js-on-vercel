export default async function handler(req, res) {
  // --- CONFIGURACIÓN DE CORS ---
  res.setHeader('Access-Control-Allow-Origin', 'https://psicoboost.es');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24h cache preflight

  // --- RESPUESTA AL PREFLIGHT (OPTIONS) ---
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- SOLO ACEPTAMOS POST ---
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log("✅ Petición recibida:", req.body);

    // Aquí iría tu lógica de envío a Brevo
    // const response = await fetch('https://api.brevo.com/v3/smtp/email', { ... });

    return res.status(200).json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error("❌ Error al enviar:", error);
    return res.status(500).json({ error: 'Error al enviar el correo' });
  }
}
