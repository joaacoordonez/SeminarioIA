import { useState, useEffect, useRef } from 'react';
import servicioApi from '../servicios/servicioApi';
import './ChatInterface.css';

const ChatInterface = ({ sesionId }) => {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const mensajesRef = useRef(null);

  useEffect(() => {
    cargarMensajes();
  }, [sesionId]);

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  const cargarMensajes = async () => {
    try {
      const respuesta = await servicioApi.obtenerMensajes(sesionId);
      setMensajes(respuesta.data.mensajes);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    setCargando(true);
    const mensajeUsuario = nuevoMensaje;
    setNuevoMensaje('');

    // Agregar mensaje del usuario inmediatamente
    const mensajeTemp = {
      id: Date.now(),
      tipo: 'usuario',
      contenido: mensajeUsuario,
      created_at: new Date().toISOString()
    };
    setMensajes(prev => [...prev, mensajeTemp]);

    try {
      const respuesta = await servicioApi.enviarMensaje({
        sesion_id: sesionId,
        mensaje: mensajeUsuario
      });

      // Agregar respuesta de la IA
      const mensajeIA = {
        id: respuesta.data.mensaje_id,
        tipo: 'ia',
        contenido: respuesta.data.respuesta,
        created_at: new Date().toISOString()
      };
      setMensajes(prev => [...prev, mensajeIA]);

      // Recargar mensajes para asegurar que estén actualizados
      await cargarMensajes();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      // Remover mensaje temporal en caso de error
      setMensajes(prev => prev.filter(msg => msg.id !== mensajeTemp.id));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="mensajes" ref={mensajesRef}>
        {mensajes.map((mensaje) => (
          <div key={mensaje.id} className={`mensaje ${mensaje.tipo}`}>
            <div className="contenido-mensaje">
              {mensaje.tipo === 'usuario' ? 'Tú: ' : 'IA: '}
              {mensaje.contenido}
            </div>
            <div className="fecha-mensaje">
              {new Date(mensaje.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="mensaje ia">
            <div className="contenido-mensaje">IA está pensando...</div>
          </div>
        )}
      </div>
      <form onSubmit={enviarMensaje} className="formulario-mensaje">
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe tu mensaje..."
          disabled={cargando}
        />
        <button type="submit" disabled={cargando || !nuevoMensaje.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
