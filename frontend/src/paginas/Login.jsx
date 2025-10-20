import FormularioLogin from '../componentes/FormularioLogin';
import './Login.css';

const Login = () => {
  return (
    <div className="pagina-login">
      <h1>SeminarioIA</h1>
      <p>Plataforma de apuntes con chatbot de estudio</p>
      <FormularioLogin />
    </div>
  );
};

export default Login;
