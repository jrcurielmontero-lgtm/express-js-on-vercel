
import axios from "axios";
import OpenAI from "openai";
import nodemailer from "nodemailer";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BREVO_SMTP_PASS = process.env.BREVO_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { event, contact } = req.body;

    // Verifica que el trigger corresponde al campo COMPLETADO_T2
    if (!contact || !contact.attributes?.COMPLETADO_T2) {
      return res.status(200).json({ status: "ignored" });
    }

    if (contact.attributes.COMPLETADO_T2 !== true) {
      return res.status(200).json({ status: "not completed" });
    }

    const email = contact.email;
    const leadData = await getLeadData(email);
    const proposal = await generateProposal(leadData);
    await sendProposalEmail(proposal, email);

    return res.status(200).json({ status: "ok" });

  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

// === Función para obtener los datos del contacto desde Brevo ===
async function getLeadData(email) {
  const res = await axios.get(`https://api.brevo.com/v3/contacts/${email}`, {
    headers: { "api-key": BREVO_API_KEY },
  });
  return res.data.attributes;
}

// === Función para generar propuesta comercial con GPT ===
async function generateProposal(data) {
  const services = `
1. Gestión de RRSS (Instagram, Facebook, LinkedIn)
   - Creación de copies y diseños con IA.
   - Publicaciones programadas con Metricool o Publer.
2. Diseño básico
   - Logo, banners, plantillas usando Canva Pro + IA.
3. Operativa de marketing
   - Funnels simples con MailerLite o ActiveCampaign.
   - Formularios de contacto y reservas online.
4. SEO básico
   - Optimización on-page con SurferSEO o NeuronWriter.
5. Informes automáticos
   - Google Data Studio vinculado a RRSS y funnels.
  `;

  const prompt = `
Eres un experto en marketing digital para psicólogos. Genera una propuesta comercial personalizada para ${data.NOMBRE_NEGOCIO || "el cliente"}.

Datos del cliente:
- Nombre: ${data.NOMBRE || "no especificado"}
- Tipo de entidad: ${data.TIPO_ENTIDAD || "no especificado"}
- CCAA: ${data.CCAA || "no especificado"}
- Nivel digital: ${data.NIVEL_DIGITAL || "no especificado"}
- Especialidad: ${data.ESPECIALIDAD || "no especificado"}
- Plan de interés: ${data.PLAN_INTERES || "no especificado"}
- Objetivo detallado: ${data.OBJETIVO_DETALLADO || "no especificado"}
- Redes sociales: 
  Instagram: ${data.CUENTA_INSTAGRAM || "no"}
  Facebook: ${data.CUENTA_FACEBOOK || "no"}
  TikTok: ${data.CUENTA_TIKTOK || "no"}
  YouTube: ${data.CUENTA_YOTUBE || "no"}
  X: ${data.CUENTA_X || "no"}

Servicios disponibles:
${services}

Estructura de salida:
1. Introducción personalizada
2. Diagnóstico del estado digital actual
3. Estrategia propuesta (en 3-5 apartados)
4. Plan de acción con tareas concretas
5. Precio del plan (${data.PLAN_INTERES})
6. Mensaje final que invite a agendar reunión
Usa tono consultivo, profesional y convincente.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content;
}

// === Función para enviar el correo ===
async function sendProposalEmail(proposal, emailLead) {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: "apikey",
      pass: BREVO_SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"PsicoBoost" <no-reply@psicoboost.es>',
    to: "gestor@psicoboost.es",
    subject: `Nueva propuesta generada: ${emailLead}`,
    text: proposal,
  });
}
