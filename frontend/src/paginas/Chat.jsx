import { useParams, useNavigate } from 'react-router-dom';
import ChatInterface from '../componentes/ChatInterface';
import './Chat.css';

const Chat = () => {
  const { sesionId } = useParams();
  const navigate = useNavigate();

  const volverDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="pagina-chat">
      <header>
        <h1>Chat de Estudio</h1>
        <button onClick={volverDashboard}>Volver al Dashboard</button>
      </header>

      <div className="contenido-chat">
        <ChatInterface sesionId={sesionId} />
      </div>
    </div>
  );
};

export default Chat;
