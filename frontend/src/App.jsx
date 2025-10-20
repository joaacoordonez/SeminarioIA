import { Routes, Route } from 'react-router-dom'
import Login from './paginas/Login'
import Registro from './paginas/Registro'
import Dashboard from './paginas/Dashboard'
import Chat from './paginas/Chat'
import './App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat/:sesionId" element={<Chat />} />
      </Routes>
    </div>
  )
}

export default App
