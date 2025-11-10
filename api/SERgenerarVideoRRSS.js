import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt, imageUrl, duration = 8 } = req.body;
  const apiKey = process.env.SHOTSTACK_API_KEY;
  const endpoint = "https://api.shotstack.io/stage/render";


  if (!apiKey) {
    return res.status(500).json({ error: "Falta SHOTSTACK_API_KEY" });
  }

  try {
    // 🎬 1️⃣ Clip de texto (título superpuesto)
    const textClip = {
      asset: {
        type: "title",
        text: prompt.slice(0, 120) + "...",
        style: "minimal",
        size: "medium",
        color: "#ffffff",
        background: "#000000",
      },
      start: 0,
      length: duration,
      position: "center",
    };

    // 🎬 2️⃣ Clip de imagen si se proporciona
    const imageClip = imageUrl
      ? {
          asset: {
            type: "image",
            src: imageUrl,
            fit: "cover",
          },
          start: 0,
          length: duration,
        }
      : null;

    // 🎞️ 3️⃣ Cada track DEBE tener un array de clips
    const tracks = [
      {
        clips: imageClip ? [imageClip, textClip] : [textClip],
      },
    ];

    // 🎧 4️⃣ Timeline completo
    const timeline = {
      background: "#000000",
      soundtrack: {
        src: "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/freeflow.mp3",
        effect: "fadeInFadeOut",
      },
      tracks,
    };

    // 📺 5️⃣ Configuración de salida
    const output = {
      format: "mp4",
      resolution: "hd",
      aspectRatio: "9:16",
    };

    const payload = { timeline, output };

    // 🚀 6️⃣ Llamada a la API de Shotstack
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });


    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error Shotstack:", data);
      return res.status(response.status).json({
        error: "Error al generar video",
        details: data,
      });
    }

    // ✅ 7️⃣ Devuelve el renderId
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
