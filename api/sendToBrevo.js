const fetch = require('node-fetch'); // o axios si lo usas

module.exports = async (req, res) => {
  // (Opcional) volver a asegurarnos de los headers por si cae aquí de otra ruta
  const ALLOWED = 'https://psicoboost.es';
  if (req.headers.origin === ALLOWED) res.setHeader('Access-Control-Allow-Origin', ALLOWED);

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const data = req.body || {};
    console.log('Petición recibida en sendToBrevo:', data);

    // aquí integras a Brevo (ejemplo mínimo comentado)
    // const brevoRes = await fetch('https://api.brevo.com/v3/contacts', { ... });

    return res.status(200).json({ ok: true, received: data });
  } catch (err) {
    console.error('Error interno:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
};
