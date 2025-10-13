export default async function handler(req, res) {
  // Permitir CORS para tu dominio
  res.setHeader('Access-Control-Allow-Origin', 'https://psicoboost.es');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Respuesta a preflight
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const data = req.body;
    console.log('Petición recibida:', data);

    // Aquí iría tu lógica de envío a Brevo
    return res.status(200).json({ message: 'OK', data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno' });
  }
}
