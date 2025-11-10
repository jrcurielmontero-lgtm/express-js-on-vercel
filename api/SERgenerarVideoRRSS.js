import fetch from "node-fetch";

// Este endpoint genera un video cinematográfico a partir de un prompt
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

  try {
    // 1️⃣ Dividir prompt en escenas o acciones
    const scenes = prompt.split(/[\.;]\s*/).filter(s => s.length > 0);

    // 2️⃣ Generar imágenes para cada escena usando la API de IA
    const images = [];
    for (const scene of scenes) {
      const imageResponse = await fetch("https://api.deevid.ai/generate", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.DEEVID_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: scene, style: "cinematographic" })
      });
      const imageData = await imageResponse.json();
      images.push(imageData.url); // URL de la imagen generada
    }

    // 3️⃣ Montar las imágenes en un video usando Shotstack (o ffmpeg)
    const clips = images.map((imgUrl, i) => ({
      asset: { type: "image", src: imgUrl },
      start: i * 3,  // cada escena dura 3s
      length: 3,
      transition: { in: "fade", out: "fade" }
    }));

    const payload = {
      timeline: { background: "#000000", tracks: [{ clips }] },
      output: { format: "mp4", resolution: "hd", aspectRatio: "16:9" }
    };

    const shotstackResponse = await fetch(`https://api.shotstack.io/stage/render`, {
      method: "POST",
      headers: { "x-api-key": process.env.SHOTSTACK_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const renderData = await shotstackResponse.json();

    return res.status(200).json({
      ok: true,
      message: "Render en proceso",
      renderId: renderData.response.id
    });

  } catch (err) {
    console.error("💥 Error generando video cinematográfico:", err);
    return res.status(500).json({ error: "Error interno", details: err.message });
  }
}
