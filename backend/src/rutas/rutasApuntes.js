import express from 'express';
import controladorApuntes from '../controladores/controladorApuntes.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// POST /api/apuntes
router.post('/', upload.single('archivo'), controladorApuntes.controlador.subirApunte);

// GET /api/apuntes
router.get('/', controladorApuntes.controlador.obtenerApuntes);

// GET /api/apuntes/:id
router.get('/:id', controladorApuntes.controlador.obtenerApunte);

// DELETE /api/apuntes/:id
router.delete('/:id', controladorApuntes.controlador.eliminarApunte);

export default router;
