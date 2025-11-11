import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Falta prompt" });

  const model = process.env.VEO3_MODEL_ID;
  const location = process.env.LOCATION;
  const project = process.env.PROJECT_ID;
  const apiKey = process.env.VEO3_API_KEY; // si lo habilitaste para Vertex AI

  try {
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:predictLongRunning`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt,
            output_video_format: "mp4",
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error Veo3:", data);
      return res.status(response.status).json({
        error: "Error al generar video",
        details: data,
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Video en proceso",
      operation: data.name || data.operation,
    });
  } catch (err) {
    console.error("💥 Error Veo3:", err);
    return res
      .status(500)
      .json({ error: "Error interno", details: err.message });
  }
}
