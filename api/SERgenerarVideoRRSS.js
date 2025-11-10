import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt, imageUrl, duration = 8 } = req.body;
  const apiKey = process.env.SHOTSTACK_API_KEY;
  const endpoint = "https://api.shotstack.io/stage/render";

  if (!apiKey) return res.status(500).json({ error: "Falta SHOTSTACK_API_KEY" });
  if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

  try {
    // 🔹 1️⃣ Separar acciones del prompt
    const actions = prompt.split(/[\.;]\s*/).filter(a => a.trim().length > 0);
    const clipDuration = duration / actions.length;

    const clips = actions.map((text, i) => ({
      asset: { type: "title", text: text.slice(0, 150), style: "minimal", size: "medium", color: "#ffffff", background: "#000000" },
      start: i * clipDuration,
      length: clipDuration,
      position: "center",
      transition: { in: "fade", out: "fade" }, // fundido entrada/salida
    }));

    // 🔹 2️⃣ Fondo opcional (si se proporciona imageUrl)
    const trackClips = imageUrl
      ? [{ asset: { type: "image", src: imageUrl }, start: 0, length: duration }, ...clips]
      : clips;

    const tracks = [{ clips: trackClips }];

    const timeline = { background: "#000000", tracks };

    const output = { format: "mp4", resolution: "hd", aspectRatio: "9:16" };

    const payload = { timeline, output };

    // 🔹 3️⃣ Llamada a Shotstack
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error Shotstack:", data);
      return res.status(response.status).json({ error: "Error al generar video", details: data });
    }

    return res.status(200).json({
      ok: true,
      renderId: data.response.id,
      message: "Render en proceso. Consulta el estado con SERRSScheckRenderStatus.js.",
    });
  } catch (err) {
    console.error("💥 Error generarVideoRRSS:", err);
    return res.status(500).json({ error: "Error interno", details: err.message });
  }
}
