import axios from 'axios';
import * as pdfParse from 'pdf-parse';

class ServicioOllama {
  constructor() {
    this.baseURL = process.env.OLLAMA_URL || 'http://localhost:11434';

    // Prompt base para todas las interacciones
    this.systemPrompt = `
Eres un asistente educativo experto. Tu rol es actuar como un tutor virtual que:

1. Genera preguntas de estudio:
   - Basadas únicamente en el contenido de los apuntes proporcionados.
   - Pueden ser abiertas o de opción múltiple.
   - No inventes información que no esté en los apuntes.

2. Responde preguntas del usuario:
   - Explica conceptos con claridad y de manera educativa.
   - Usa el contexto de los apuntes si está disponible.
   - Responde siempre en español.

3. Genera títulos:
   - Para cualquier texto o PDF.
   - Máximo 50 caracteres, concisos y descriptivos.
   - Siempre en español, relevantes al contenido.

4. Mantén siempre:
   - Estilo educativo, claro y profesional.
   - Coherencia con los apuntes proporcionados.
   - Respuestas únicamente en español.
`;
  }

  // --- Función para generar respuesta educativa ---
  async generarRespuesta(mensaje, contexto = '') {
    try {
      // No truncar contexto para tener todo el contexto disponible
      console.log(`Longitud del contexto: ${contexto.length}`);

      const prompt = contexto
        ? `${this.systemPrompt}\nContexto de los apuntes:\n${contexto}\n\nPregunta del usuario: ${mensaje}\n\nResponde de manera educativa y útil:`
        : `${this.systemPrompt}\nPregunta del usuario: ${mensaje}\n\nResponde de manera educativa y útil:`;

      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        { model: 'llama2', prompt, stream: false },
        { timeout: 300000 } // Aumentado a 5 minutos para contextos largos
      );

      return response.data.response.replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('Error generando respuesta:', error.response?.data || error.message);
      throw new Error('No se pudo generar la respuesta con Ollama.');
    }
  }

  // --- Función para generar una pregunta de estudio ---
  async generarPregunta(contexto) {
    try {
      // Truncar contexto a 2000 caracteres para evitar timeouts
      const contextoTruncado = contexto.length > 2000 ? contexto.substring(0, 2000) + '...' : contexto;
      console.log(`Longitud del contexto para pregunta: ${contexto.length}, truncado a: ${contextoTruncado.length}`);

      const prompt = `${this.systemPrompt}\nBasado en el siguiente contenido de apuntes, genera una pregunta de estudio clara y precisa (puede ser de opción múltiple). Asegúrate de que las opciones estén en español y sean gramaticalmente correctas:\n\n${contextoTruncado}\n\nPregunta:`;

      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        { model: 'llama2', prompt, stream: false },
        { timeout: 120000 } // Aumentado a 2 minutos
      );

      return response.data.response.replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('Error generando pregunta:', error.response?.data || error.message);
      throw new Error('No se pudo generar la pregunta con Ollama.');
    }
  }

  // --- Función para generar título descriptivo ---
  async generarTitulo(contenido, tipo = 'texto') {
    try {
      // Usar más contenido para mejores títulos
      const maxLength = tipo === 'pdf' ? 3000 : 1500;
      const fragmento = contenido.substring(0, maxLength);

      const prompt = `${this.systemPrompt}\nGenera un título descriptivo y conciso (máximo 50 caracteres) para el siguiente contenido. El título debe ser en español y reflejar exactamente el tema principal del contenido:\n\n${fragmento}\n\nTítulo:`;

      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        { model: 'llama2', prompt, stream: false },
        { timeout: 120000 } // Aumentado a 2 minutos
      );

      const tituloGenerado = response.data.response.replace(/\s+/g, ' ').trim();
      return tituloGenerado.length > 50 ? tituloGenerado.substring(0, 47) + '...' : tituloGenerado;
    } catch (error) {
      console.error('Error generando título:', error.response?.data || error.message);
      return 'Apunte sin título';
    }
  }

  // --- Función para extraer texto de un PDF ---
  async extraerTextoPDF(buffer) {
    try {
      const data = await pdfParse(buffer);
      return data.text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error('Error extrayendo texto del PDF:', error.message);
      throw new Error('No se pudo procesar el PDF.');
    }
  }
}

export default new ServicioOllama();
