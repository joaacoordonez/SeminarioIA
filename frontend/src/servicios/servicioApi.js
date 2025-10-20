import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const servicioApi = {
  // Usuarios
  registrar: (datos) => api.post('/usuarios/registro', datos),
  iniciarSesion: (datos) => api.post('/usuarios/login', datos),
  cerrarSesion: () => api.post('/usuarios/logout'),
  obtenerPerfil: () => api.get('/usuarios/perfil'),

  // Apuntes
  subirApunte: (datos) => api.post('/apuntes', datos),
  obtenerApuntes: () => api.get('/apuntes'),
  obtenerApunte: (id) => api.get(`/apuntes/${id}`),
  eliminarApunte: (id) => api.delete(`/apuntes/${id}`),

  // Chat
  crearSesion: (datos) => api.post('/chat/sesiones', datos),
  obtenerSesiones: () => api.get('/chat/sesiones'),
  enviarMensaje: (datos) => api.post('/chat/mensajes', datos),
  obtenerMensajes: (sesionId) => api.get(`/chat/sesiones/${sesionId}/mensajes`),
  eliminarSesion: (id) => api.delete(`/chat/sesiones/${id}`),
};

export default servicioApi;
