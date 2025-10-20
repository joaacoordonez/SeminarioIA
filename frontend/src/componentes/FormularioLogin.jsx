import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import servicioApi from '../servicios/servicioApi';
import './FormularioLogin.css';

const FormularioLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const respuesta = await servicioApi.iniciarSesion({ email, password });
      localStorage.setItem('token', respuesta.data.sesion.access_token);
      navigate('/dashboard');
    } catch (error) {
      setError('Credenciales inválidas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="formulario-login">
      <h2>Iniciar Sesión</h2>
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
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={cargando}>
          {cargando ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
      </form>
      <p>
        ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
      </p>
    </div>
  );
};

export default FormularioLogin;
