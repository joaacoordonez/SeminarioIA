import supabase from '../servicios/servicioSupabase.js';

class ControladorUsuarios {
  async registrar(req, res) {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ usuario: data.user, mensaje: 'Usuario registrado exitosamente' });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async iniciarSesion(req, res) {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      res.json({ usuario: data.user, sesion: data.session, mensaje: 'Inicio de sesión exitoso' });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async cerrarSesion(req, res) {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ mensaje: 'Sesión cerrada exitosamente' });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async obtenerPerfil(req, res) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      res.json({ usuario: user });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default new ControladorUsuarios();
