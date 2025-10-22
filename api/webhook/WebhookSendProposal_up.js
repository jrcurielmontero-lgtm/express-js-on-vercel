export default async function handler(req, res) {
  console.log("Webhook activo");
  return res.status(200).json({ ok: true });
}
