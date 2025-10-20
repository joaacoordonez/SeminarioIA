import { useState } from 'react';
import servicioApi from '../servicios/servicioApi';
import './FormularioApunte.css';

const FormularioApunte = ({ onApunteCreado }) => {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [tipo, setTipo] = useState('texto');
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [generarTituloAuto, setGenerarTituloAuto] = useState(true);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const formData = new FormData();
      // Solo enviar título si no está vacío y no se quiere generar automáticamente
      if (!generarTituloAuto && titulo.trim()) {
        formData.append('titulo', titulo);
      }
      formData.append('contenido', contenido);
      formData.append('tipo', tipo);

      if (archivo) {
        formData.append('archivo', archivo);
      }

      const respuesta = await servicioApi.subirApunte(formData);
      onApunteCreado(respuesta.data.apunte);

      // Limpiar formulario
      setTitulo('');
      setContenido('');
      setArchivo(null);

      // Recargar la página para mostrar el nuevo apunte
      window.location.reload();
    } catch (error) {
      console.error('Error al subir apunte:', error);
    } finally {
      setCargando(false);
    }
  };

  const manejarCambioArchivo = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setArchivo(file);
      setTipo('pdf');
    } else if (file) {
      alert('Solo se permiten archivos PDF');
    }
  };

  return (
    <div className="formulario-apunte">
      <h3>Subir Nuevo Apunte</h3>
      <form onSubmit={manejarEnvio}>
        <div>
          <label htmlFor="titulo">Título:</label>
          <input
            type="text"
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Deja vacío para generar automáticamente"
            disabled={generarTituloAuto}
          />
          <div className="titulo-opciones">
            <label>
              <input
                type="checkbox"
                checked={generarTituloAuto}
                onChange={(e) => setGenerarTituloAuto(e.target.checked)}
              />
              Generar título automáticamente
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="tipo">Tipo:</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="texto">Texto</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        {tipo === 'texto' ? (
          <div>
            <label htmlFor="contenido">Contenido:</label>
            <textarea
              id="contenido"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
            />
          </div>
        ) : (
          <div>
            <label htmlFor="archivo">Archivo PDF:</label>
            <input
              type="file"
              id="archivo"
              accept=".pdf"
              onChange={manejarCambioArchivo}
              required
            />
          </div>
        )}
        <button type="submit" disabled={cargando}>
          {cargando ? 'Subiendo...' : 'Subir Apunte'}
        </button>
      </form>
    </div>
  );
};

export default FormularioApunte;
