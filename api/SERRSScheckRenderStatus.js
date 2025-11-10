import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { renderId } = req.query;
  const apiKey = process.env.SHOTSTACK_API_KEY;

  if (!renderId) {
    return res.status(400).json({ error: "Falta el parámetro renderId" });
  }

  if (!apiKey) {
    return res.status(500).json({ error: "Falta SHOTSTACK_API_KEY" });
  }

  try {
    const response = await fetch(`https://api.shotstack.io/stage/render/${renderId}`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error consultando Shotstack:", data);
      return res.status(response.status).json({
        error: "Error al consultar estado del render",
        details: data,
      });
    }

    const status = data?.response?.status || "unknown";
    const url = data?.response?.url || null;

    return res.status(200).json({
      ok: true,
      renderId,
      status,
      videoUrl: url,
      message:
        status === "done"
          ? "Render finalizado, video listo."
          : `Render aún en proceso (${status}).`,
    });
  } catch (err) {
    console.error("💥 Error checkRenderStatus:", err);
    return res.status(500).json({ error: "Error interno", details: err.message });
  }
}
