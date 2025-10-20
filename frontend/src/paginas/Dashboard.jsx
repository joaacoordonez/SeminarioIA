import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormularioApunte from '../componentes/FormularioApunte';
import ListaApuntes from '../componentes/ListaApuntes';
import servicioApi from '../servicios/servicioApi';
import './Dashboard.css';

const Dashboard = () => {
  const [apunteSeleccionado, setApunteSeleccionado] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    verificarAutenticacion();
    cargarSesiones();
  }, []);

  const verificarAutenticacion = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  };

  const cargarSesiones = async () => {
    try {
      const respuesta = await servicioApi.obtenerSesiones();
      setSesiones(respuesta.data.sesiones);
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
    }
  };

  const manejarApunteCreado = (apunte) => {
    // Recargar apuntes si es necesario
    console.log('Apunte creado:', apunte);
  };

  const manejarSeleccionApunte = (apunte) => {
    setApunteSeleccionado(apunte);
  };

  const iniciarChat = async () => {
    if (!apunteSeleccionado) return;

    try {
      const respuesta = await servicioApi.crearSesion({
        titulo: `Chat sobre ${apunteSeleccionado.titulo}`,
        apunte_id: apunteSeleccionado.id
      });

      navigate(`/chat/${respuesta.data.sesion.id}`);
    } catch (error) {
      console.error('Error al crear sesión:', error);
    }
  };

  const abrirChat = (sesionId) => {
    navigate(`/chat/${sesionId}`);
  };

  const eliminarSesion = async (sesionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta sesión de chat?')) {
      try {
        await servicioApi.eliminarSesion(sesionId);
        setSesiones(sesiones.filter(sesion => sesion.id !== sesionId));
      } catch (error) {
        console.error('Error al eliminar sesión:', error);
      }
    }
  };

  const cerrarSesion = async () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard">
      <header>
        <h1>SeminarioIA - Dashboard</h1>
        <button onClick={cerrarSesion}>Cerrar Sesión</button>
      </header>

      <div className="contenido-dashboard">
        <div className="panel-apuntes">
          <FormularioApunte onApunteCreado={manejarApunteCreado} />
          <ListaApuntes onSeleccionarApunte={manejarSeleccionApunte} />
        </div>

        <div className="panel-chat">
          {apunteSeleccionado ? (
            <div>
              <h3>Apunte seleccionado: {apunteSeleccionado.titulo}</h3>
              <button onClick={iniciarChat}>Iniciar Chat de Estudio</button>
            </div>
          ) : (
            <p>Selecciona un apunte para iniciar un chat de estudio</p>
          )}

          <div className="sesiones-anteriores">
            <h3>Sesiones de Chat Anteriores</h3>
            {sesiones.length === 0 ? (
              <p>No tienes sesiones de chat aún.</p>
            ) : (
              <ul>
                {sesiones.map((sesion) => (
                  <li key={sesion.id}>
                    <span>{sesion.titulo}</span>
                    <button onClick={() => abrirChat(sesion.id)}>Abrir</button>
                    <button onClick={() => eliminarSesion(sesion.id)}>Eliminar</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
