export default async function handler(req, res) {
  console.log("Webhook de prueba activo");
  res.status(200).json({ ok: true });
}
