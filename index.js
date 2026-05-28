const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

const SYSTEM_PROMPT = `Eres el asistente virtual de Clínica Médica. 
Respondes preguntas sobre:
- Horarios: Lunes a Viernes 8am-6pm, Sábados 8am-1pm
- Precios: Consulta general $25, Especialista $40
- Ubicación: Av. Principal 123
- Agendar citas: pide nombre, fecha preferida y especialidad
Siempre eres amable y profesional. Si no sabes algo, di que un asesor le contactará pronto.`;

app.post('/webhook', async (req, res) => {
  const mensaje = req.body.Body;
  const numero = req.body.From;

  console.log(`Mensaje de ${numero}: ${mensaje}`);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: mensaje }]
    });

    const respuesta = response.content[0].text;
    console.log(`Respuesta: ${respuesta}`);

    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${respuesta}</Message>
</Response>`);

  } catch (error) {
    console.error('Error:', error);
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>En este momento no puedo responder. Por favor llame al consultorio.</Message>
</Response>`);
  }
});

app.get('/', (req, res) => {
  res.send('Bot Clínica funcionando');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
