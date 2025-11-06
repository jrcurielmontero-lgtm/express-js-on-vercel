import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt, imageUrl, duration = 8 } = req.body;
  const apiKey = process.env.SHOTSTACK_API_KEY;
  const region = process.env.SHOTSTACK_REGION || "au1";

  if (!apiKey) {
    return res.status(500).json({ error: "Falta SHOTSTACK_API_KEY" });
  }

  try {
    // === 1️⃣ Construcción del template básico ===
    const clip = {
      asset: {
        type: "title",
        text: prompt.slice(0, 120) + "...", // limitar texto
        style: "minimal",
        size: "medium",
        color: "#ffffff",
        background: "#000000",
      },
      length: duration,
      start: 0,
    };

    // Si existe imagen, se añade como fondo
    const track = imageUrl
      ? [
          {
            asset: { type: "image", src: imageUrl, fit: "cover" },
            length: duration,
            start: 0,
          },
          clip,
        ]
      : [clip];

    const timeline = { background: "#000000", tracks: [track] };

    const output = {
      format: "mp4",
      resolution: "hd",
      fps: 25,
      aspectRatio: "9:16",
    };

    const payload = { timeline, output };

    // === 2️⃣ Llamada a Shotstack API ===
    const response = await fetch(
      `https://api.${region}.shotstack.io/stage/render`,
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error Shotstack:", data);
      return res
        .status(response.status)
        .json({ error: "Error al generar video", details: data });
    }

    // === 3️⃣ Devuelve el render ID (puedes consultar luego su estado o URL final) ===
    return res.status(200).json({
      ok: true,
      renderId: data.response.id,
      message: "Render en proceso. Consulta el estado en unos minutos.",
    });
  } catch (err) {
    console.error("💥 Error generarVideoRRSS:", err);
    return res.status(500).json({ error: "Error interno", details: err.message });
  }
}
