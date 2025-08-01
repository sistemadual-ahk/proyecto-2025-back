import OpenAI from 'openai';
import fs from 'fs'; // Necesario para leer archivos de imagen y audio

const client = new OpenAI({
  apiKey: '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',
});

function extraerJSONDeRespuesta(texto: string): string | null {
  const match = texto.match(/```json\n([\s\S]*)\n```/);
  if (match && match[1]) {
    return match[1].trim();
  }

  try {
    JSON.parse(texto);
    return texto;
  } catch (e) {
    return null;
  }
}

async function procesarEntrada(tipoEntrada: 'texto' | 'imagen' | 'audio', datos: string) {
  let resultadoAPI;

  const promptBase = `
    Analiza la siguiente información de un gasto y extrae los siguientes campos: total, fecha, nombre del comercio y concepto.
    Responde ÚNICAMENTE con un objeto JSON válido, sin ningún texto adicional, saludos o explicaciones.
    El formato del JSON debe ser: {"total": NUMERO, "fecha": "YYYY-MM-DD", "comercio": "NOMBRE_COMERCIO", "concepto": "DESCRIPCION"}.
    Si no puedes encontrar algún campo, usa un valor null.
  `;

  try {
    if (tipoEntrada === 'texto') {
      // 1. Manejar mensajes de texto
      console.log('Procesando mensaje de texto...');
      resultadoAPI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: `${promptBase}\n\nInformación: ${datos}`,
        }],
      });
    } else if (tipoEntrada === 'imagen') {
      // 2. Manejar imágenes de tickets de gasto
      console.log('Procesando imagen de ticket...');
      const imagenBase64 = fs.readFileSync(datos, 'base64');
      resultadoAPI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: promptBase },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imagenBase64}` } },
          ],
        }],
      });
    } else if (tipoEntrada === 'audio') {
      console.log('Procesando audio de gasto...');
      const transcripcion = await client.audio.transcriptions.create({
        model: 'whisper-1',
        file: fs.createReadStream(datos),
      });
      console.log('Transcripción del audio:', transcripcion.text);

      resultadoAPI = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: `${promptBase}\n\nInformación: ${transcripcion.text}`,
        }],
      });
    } else {
      console.log('Tipo de entrada no soportado.');
      return;
    }

    const respuestaDeOpenAI = resultadoAPI.choices[0].message.content || '';
    console.log('Respuesta cruda de OpenAI:', respuestaDeOpenAI);

    const jsonLimpio = extraerJSONDeRespuesta(respuestaDeOpenAI);

    if (jsonLimpio) {
        try {
            const datosDeGasto = JSON.parse(jsonLimpio);
            console.log('Gasto procesado y listo para guardar:', datosDeGasto);
        } catch (e) {
            console.error('Error al parsear el JSON limpio:', e);
        }
    } else {
        console.error('No se pudo extraer un JSON válido de la respuesta. La respuesta fue:', respuestaDeOpenAI);
    }

  } catch (error) {
    console.error('Ocurrió un error en el procesamiento:', error);
  }
}


// Ejemplo de cómo llamar a la función
//procesarEntrada('texto', 'Compré comida por $25 en el restaurante La Esquina el 1 de agosto.');
//procesarEntrada('imagen', './ticket.png');
// procesarEntrada('audio', './gasto.mp3');