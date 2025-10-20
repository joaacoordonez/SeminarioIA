import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import rutasUsuarios from './src/rutas/rutasUsuarios.js';
import rutasApuntes from './src/rutas/rutasApuntes.js';
import rutasChat from './src/rutas/rutasChat.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/apuntes', rutasApuntes);
app.use('/api/chat', rutasChat);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de SeminarioIA funcionando' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

export default app;
