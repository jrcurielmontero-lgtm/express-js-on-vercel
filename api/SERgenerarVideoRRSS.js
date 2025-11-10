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
    // Clip de texto superpuesto (solo con información del prompt)
    const textClip = {
      asset: { type: "title", text: prompt.slice(0, 120) + "...", style: "minimal", size: "medium", color: "#ffffff", background: "#000000" },
      start: 0,
      length: duration,
      position: "center",
    };

    // Clip de imagen opcional
    const imageClip = imageUrl ? { asset: { type: "image", src: imageUrl }, start: 0, length: duration } : null;

    // Cada track DEBE tener clips[]
    const tracks = [{ clips: imageClip ? [imageClip, textClip] : [textClip] }];

    const timeline = {
      background: "#000000",
      tracks,
    };

    const output = { format: "mp4", resolution: "hd", aspectRatio: "9:16" };

    const payload = { timeline, output };

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
