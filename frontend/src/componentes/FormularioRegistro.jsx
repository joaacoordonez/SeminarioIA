import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import servicioApi from '../servicios/servicioApi';
import './FormularioRegistro.css';

const FormularioRegistro = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);

    try {
      await servicioApi.registrar({ email, password });
      navigate('/');
    } catch (error) {
      setError('Error al registrar usuario');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="formulario-registro">
      <h2>Registro</h2>
      <form onSubmit={manejarEnvio}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmarPassword">Confirmar Contraseña:</label>
          <input
            type="password"
            id="confirmarPassword"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={cargando}>
          {cargando ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      <p>
        ¿Ya tienes cuenta? <Link to="/">Inicia sesión aquí</Link>
      </p>
    </div>
  );
};

export default FormularioRegistro;
