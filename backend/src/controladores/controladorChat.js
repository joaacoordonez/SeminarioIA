import supabase from '../servicios/servicioSupabase.js';
import servicioOllama from '../servicios/servicioOllama.js';

class ControladorChat {
  async crearSesion(req, res) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const { titulo, apunte_id } = req.body;

      const { data, error } = await supabase
        .from('sesiones_chat')
        .insert([
          {
            usuario_id: user.id,
            titulo: titulo || 'Nueva sesión de chat',
            apunte_id
          }
        ])
        .select();

      if (error) {
        return res.status(500).json({ error: 'Error al crear sesión' });
      }

      res.status(201).json({ sesion: data[0], mensaje: 'Sesión creada exitosamente' });
    } catch (error) {
      console.error('Error al crear sesión:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async obtenerSesiones(req, res) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const { data, error } = await supabase
        .from('sesiones_chat')
        .select(`
          *,
          apuntes:titulo
        `)
        .eq('usuario_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Error al obtener sesiones' });
      }

      res.json({ sesiones: data });
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async enviarMensaje(req, res) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const { sesion_id, mensaje } = req.body;

      // Verificar que la sesión pertenece al usuario
      const { data: sesion, error: sesionError } = await supabase
        .from('sesiones_chat')
        .select('apunte_id')
        .eq('id', sesion_id)
        .eq('usuario_id', user.id)
        .single();

      if (sesionError) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      // Obtener el contenido del apunte para contexto
      let contexto = '';
      if (sesion.apunte_id) {
        const { data: apunte, error: apunteError } = await supabase
          .from('apuntes')
          .select('contenido')
          .eq('id', sesion.apunte_id)
          .single();

        if (!apunteError && apunte) {
          contexto = apunte.contenido;
        }
      }

      // Generar respuesta con Ollama
      const respuestaIA = await servicioOllama.generarRespuesta(mensaje, contexto);

      // Guardar mensaje del usuario
      await supabase
        .from('mensajes_chat')
        .insert([
          {
            sesion_id,
            tipo: 'usuario',
            contenido: mensaje
          }
        ]);

      // Guardar respuesta de la IA
      const { data: mensajeIA, error: mensajeError } = await supabase
        .from('mensajes_chat')
        .insert([
          {
            sesion_id,
            tipo: 'ia',
            contenido: respuestaIA
          }
        ])
        .select();

      if (mensajeError) {
        return res.status(500).json({ error: 'Error al guardar mensaje' });
      }

      // Actualizar fecha de última actividad de la sesión
      await supabase
        .from('sesiones_chat')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sesion_id);

      res.json({ respuesta: respuestaIA, mensaje_id: mensajeIA[0].id });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async obtenerMensajes(req, res) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const { sesion_id } = req.params;

      // Verificar que la sesión pertenece al usuario
      const { error: sesionError } = await supabase
        .from('sesiones_chat')
        .select('id')
        .eq('id', sesion_id)
        .eq('usuario_id', user.id)
        .single();

      if (sesionError) {
        return res.status(404).json({ error: 'Sesión no encontrada' });
      }

      const { data, error } = await supabase
        .from('mensajes_chat')
        .select('*')
        .eq('sesion_id', sesion_id)
        .order('created_at', { ascending: true });

      if (error) {
        return res.status(500).json({ error: 'Error al obtener mensajes' });
      }

      res.json({ mensajes: data });
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async eliminarSesion(req, res) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const { id } = req.params;

      // Eliminar mensajes de la sesión
      await supabase
        .from('mensajes_chat')
        .delete()
        .eq('sesion_id', id);

      // Eliminar sesión
      const { error } = await supabase
        .from('sesiones_chat')
        .delete()
        .eq('id', id)
        .eq('usuario_id', user.id);

      if (error) {
        return res.status(500).json({ error: 'Error al eliminar sesión' });
      }

      res.json({ mensaje: 'Sesión eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar sesión:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default new ControladorChat();
