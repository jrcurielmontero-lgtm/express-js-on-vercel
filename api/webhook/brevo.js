import axios from "axios";
import OpenAI from "openai";
import nodemailer from "nodemailer";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// === Webhook principal ===
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    // Respuesta rápida a Brevo
    res.status(200).json({ status: "received" });

    // Trabajo pesado en background
    await handleProposal(req.body);

  } catch (err) {
    console.error("Error en handler:", err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
}

// === Función principal de proceso ===
async function handleProposal(payload) {
  try {
    if (!payload?.contact) return console.warn("Webhook sin contacto");

    const email = payload.contact.email;
    const attrs = payload.contact.attributes || {};

    // Verifica el trigger
    if (attrs.COMPLETADO_T2 !== true) {
      console.log(`Contacto ${email}: COMPLETADO_T2 no es true. Ignorado.`);
      return;
    }

    console.log(`Webhook recibido correctamente de ${email}`);

    // 1. Obtener todos los datos del contacto desde Brevo
    const leadData = await getLeadData(email);

    // 2. Generar propuesta comercial
    const proposal = await generateProposal(leadData);

    // 3. Enviar propuesta al gestor
    await sendProposalEmail(proposal, email);

    console.log(`Propuesta generada y enviada para ${email}`);

  } catch (error) {
    console.error("Error en handleProposal:", error.message);
  }
}

// === Obtiene datos del contacto ===
async function getLeadData(email) {
  const res = await axios.get(`https://api.brevo.com/v3/contacts/${email}`, {
    headers: { "api-key": BREVO_API_KEY },
    timeout: 5000
  });
  return res.data.attributes;
}

// === Genera la propuesta comercial usando GPT ===
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
Eres un consultor de marketing digital especializado en psicólogos. 
Genera una propuesta comercial personalizada para ${data.NOMBRE_NEGOCIO || "el cliente"}.

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

Estructura del texto de salida:
1. Introducción personalizada al psicólogo.
2. Diagnóstico de la presencia digital actual.
3. Estrategia recomendada basada en su especialidad y nivel digital.
4. Plan de acción concreto (RRSS, SEO, automatizaciones, diseño).
5. Precio asociado al plan de interés (${data.PLAN_INTERES}).
6. Mensaje de cierre invitando a agendar una reunión de validación.

Tono profesional, consultivo y cercano.
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    timeout: 5000
  });

  return completion.choices[0].message.content;
}

// === Envía la propuesta por correo ===
async function sendProposalEmail(proposal, emailLead) {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: "apikey",
      pass: BREVO_API_KEY,
    },
  });

  await transporter.sendMail({
    from: '"PsicoBoost" <no-reply@psicoboost.es>',
    to: "gestor@psicoboost.es",
    subject: `Nueva propuesta generada: ${emailLead}`,
    text: proposal,
  });
}
