import express from 'express';
import controladorChat from '../controladores/controladorChat.js';

const router = express.Router();

// POST /api/chat/sesiones
router.post('/sesiones', controladorChat.crearSesion);

// GET /api/chat/sesiones
router.get('/sesiones', controladorChat.obtenerSesiones);

// POST /api/chat/mensajes
router.post('/mensajes', controladorChat.enviarMensaje);

// GET /api/chat/sesiones/:sesion_id/mensajes
router.get('/sesiones/:sesion_id/mensajes', controladorChat.obtenerMensajes);

// DELETE /api/chat/sesiones/:id
router.delete('/sesiones/:id', controladorChat.eliminarSesion);

export default router;
