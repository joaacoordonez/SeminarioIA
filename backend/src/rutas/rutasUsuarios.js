import express from 'express';
import controladorUsuarios from '../controladores/controladorUsuarios.js';

const router = express.Router();

// POST /api/usuarios/registro
router.post('/registro', controladorUsuarios.registrar);

// POST /api/usuarios/login
router.post('/login', controladorUsuarios.iniciarSesion);

// POST /api/usuarios/logout
router.post('/logout', controladorUsuarios.cerrarSesion);

// GET /api/usuarios/perfil
router.get('/perfil', controladorUsuarios.obtenerPerfil);

export default router;
