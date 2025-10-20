import { useState, useEffect } from 'react';
import servicioApi from '../servicios/servicioApi';
import './ListaApuntes.css';

const ListaApuntes = ({ onSeleccionarApunte }) => {
  const [apuntes, setApuntes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarApuntes();
  }, []);

  const cargarApuntes = async () => {
    try {
      const respuesta = await servicioApi.obtenerApuntes();
      setApuntes(respuesta.data.apuntes);
    } catch (error) {
      console.error('Error al cargar apuntes:', error);
    } finally {
      setCargando(false);
    }
  };

  const eliminarApunte = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este apunte?')) {
      try {
        await servicioApi.eliminarApunte(id);
        setApuntes(apuntes.filter(apunte => apunte.id !== id));
      } catch (error) {
        console.error('Error al eliminar apunte:', error);
      }
    }
  };

  if (cargando) {
    return <div>Cargando apuntes...</div>;
  }

  return (
    <div className="lista-apuntes">
      <h3>Mis Apuntes</h3>
      {apuntes.length === 0 ? (
        <p>No tienes apuntes aún.</p>
      ) : (
        <ul>
          {apuntes.map((apunte) => (
            <li key={apunte.id}>
              <div>
                <h4>{apunte.titulo}</h4>
                <p>Tipo: {apunte.tipo}</p>
                <p>Creado: {new Date(apunte.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <button onClick={() => onSeleccionarApunte(apunte)}>
                  Seleccionar
                </button>
                <button onClick={() => eliminarApunte(apunte.id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListaApuntes;
