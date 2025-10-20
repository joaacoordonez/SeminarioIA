import supabase from '../servicios/servicioSupabase.js';
import servicioOllama from '../servicios/servicioOllama.js';
import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

class ControladorApuntes {
  async subirApunte(req, res) {
    console.log('Iniciando subida de apunte...');
    try {
      console.log('Verificando autenticación...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log('Error de autenticación:', authError);
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      console.log('Usuario autenticado:', user.id);

      let { titulo, contenido, tipo } = req.body;
      let archivoUrl = null;
      let contenidoFinal = contenido;

      console.log('Datos recibidos:', { titulo, contenido: contenido?.substring(0, 100), tipo, hasFile: !!req.file, fileName: req.file?.originalname });

      if (req.file) {
        console.log('Procesando archivo:', req.file.originalname);
        // Subir archivo a Supabase Storage
        const fileName = `${user.id}/${Date.now()}_${req.file.originalname}`;
        console.log('Subiendo archivo a Supabase Storage:', fileName);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('apuntes')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype
          });

        if (uploadError) {
          console.log('Error al subir archivo:', uploadError);
          return res.status(500).json({ error: 'Error al subir archivo' });
        }
        console.log('Archivo subido exitosamente');

        archivoUrl = supabase.storage.from('apuntes').getPublicUrl(fileName).data.publicUrl;
        console.log('URL del archivo:', archivoUrl);

        // Extraer texto del PDF si es necesario
        if (tipo === 'pdf') {
          console.log('Extrayendo texto del PDF...');
          try {
            contenidoFinal = await servicioOllama.extraerTextoPDF(req.file.buffer);
            console.log('Texto extraído del PDF, longitud:', contenidoFinal.length);
          } catch (error) {
            console.error('Error al extraer texto del PDF:', error);
            contenidoFinal = 'Contenido no disponible (error al procesar PDF)';
          }
        }
      }

      // Generar título automáticamente si no se proporcionó o está vacío
      if (!titulo || titulo.trim() === '') {
        console.log('Generando título automáticamente...');
        try {
          titulo = await servicioOllama.generarTitulo(contenidoFinal, tipo);
          console.log('Título generado:', titulo);
        } catch (error) {
          console.error('Error al generar título:', error);
          titulo = tipo === 'pdf' ? 'Apunte PDF' : 'Apunte de texto';
        }
      }

      console.log('Guardando apunte en la base de datos...');
      // Guardar apunte en la base de datos
      const { data, error } = await supabase
        .from('apuntes')
        .insert([
          {
            usuario_id: user.id,
            titulo,
            contenido: contenidoFinal,
            tipo,
            archivo_url: archivoUrl
          }
        ])
        .select();

      if (error) {
        console.log('Error al guardar en BD:', error);
        return res.status(500).json({ error: 'Error al guardar apunte' });
      }

      console.log('Apunte guardado exitosamente');
      res.status(201).json({ apunte: data[0], mensaje: 'Apunte subido exitosamente' });
    } catch (error) {
      console.error('Error al subir apunte:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async obtenerApuntes(req, res) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const { data, error } = await supabase
        .from('apuntes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Error al obtener apuntes' });
      }

      res.json({ apuntes: data });
    } catch (error) {
      console.error('Error al obtener apuntes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async obtenerApunte(req, res) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const { id } = req.params;

      const { data, error } = await supabase
        .from('apuntes')
        .select('*')
        .eq('id', id)
        .eq('usuario_id', user.id)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Apunte no encontrado' });
      }

      res.json({ apunte: data });
    } catch (error) {
      console.error('Error al obtener apunte:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async eliminarApunte(req, res) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const { id } = req.params;

      // Obtener el apunte para eliminar el archivo si existe
      const { data: apunte, error: fetchError } = await supabase
        .from('apuntes')
        .select('archivo_url')
        .eq('id', id)
        .eq('usuario_id', user.id)
        .single();

      if (fetchError) {
        return res.status(404).json({ error: 'Apunte no encontrado' });
      }

      // Eliminar archivo de Supabase Storage si existe
      if (apunte.archivo_url) {
        const fileName = apunte.archivo_url.split('/').pop();
        await supabase.storage.from('apuntes').remove([`${user.id}/${fileName}`]);
      }

      // Eliminar apunte de la base de datos
      const { error } = await supabase
        .from('apuntes')
        .delete()
        .eq('id', id)
        .eq('usuario_id', user.id);

      if (error) {
        return res.status(500).json({ error: 'Error al eliminar apunte' });
      }

      res.json({ mensaje: 'Apunte eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar apunte:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default { controlador: new ControladorApuntes(), upload };
