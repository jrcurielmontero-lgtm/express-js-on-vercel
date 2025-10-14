const express = require('express');
const app = express();

app.use(express.json());

// --- CORS global: crucial ---
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  // permitir solo tu dominio en producción
  const ALLOWED = 'https://psicoboost.es';
  // para debug temporal podrías usar '*' (no con credentials)
  if (origin === ALLOWED) res.setHeader('Access-Control-Allow-Origin', ALLOWED);
  // headers que acepta el preflight
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');
  // no permitir caché de preflight en pruebas
  res.setHeader('Access-Control-Max-Age', '600');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// mount the route handler (module export from api/sendToBrevo.js)
const sendToBrevo = require('./api/sendToBrevo');
app.post('/api/sendToBrevo', sendToBrevo);

// health check
app.get('/', (req, res) => res.send('API funcionando 🚀'));

// export for Vercel
module.exports = app;
