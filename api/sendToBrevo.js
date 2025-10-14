// /api/sendToBrevo.js
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({
    origin: 'https://psicoboost.es', // tu front
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

app.post('/api/sendToBrevo', async (req, res) => {
    console.log('✅ Petición POST recibida a /api/sendToBrevo');
    console.log('📦 Body recibido:', req.body);

    const { nombre, email } = req.body;

    if (!nombre || !email) {
        console.warn('⚠️ Falta nombre o email en la petición');
        return res.status(400).json({ message: 'Faltan datos: nombre o email' });
    }

    const payload = {
        email,
        attributes: { NOMBRE: nombre },
        listIds: [2], // Ajusta el ID de tu lista
    };

    console.log('📤 Payload para Brevo:', payload);

    try {
        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        console.log('📥 Respuesta de Brevo:', data);
        console.log('🧾 Status de la respuesta:', response.status);

        if (!response.ok) {
            console.error('❌ Error en la API de Brevo', data);
            return res.status(response.status).json({
                message: 'Error al enviar contacto a Brevo',
                brevoResponse: data
            });
        }

        return res.status(200).json({
            message: 'Contacto enviado correctamente a Brevo',
            brevoResponse: data
        });
    } catch (error) {
        console.error('💥 Error inesperado al enviar a Brevo:', error);
        return res.status(500).json({
            message: 'Error interno al enviar a Brevo',
            error: error.message
        });
    }
});

// Para OPTIONS preflight
app.options('/api/sendToBrevo', (req, res) => {
    console.log('✅ Preflight OPTIONS recibido');
    res.sendStatus(204);
});

export default app;
