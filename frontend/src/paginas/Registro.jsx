import FormularioRegistro from '../componentes/FormularioRegistro';
import './Registro.css';

const Registro = () => {
  return (
    <div className="pagina-registro">
      <h1>SeminarioIA</h1>
      <p>Únete a nuestra plataforma de estudio</p>
      <FormularioRegistro />
    </div>
  );
};

export default Registro;
