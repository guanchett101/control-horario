import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = 'http://localhost:3001/api';

function RegistroHorario({ user, onLogout }) {
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const registrarEntrada = async () => {
    setMensaje('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/registros/entrada`, {
        empleadoId: user.empleadoId
      });
      setMensaje(`Entrada registrada a las ${response.data.hora}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar entrada');
    } finally {
      setLoading(false);
    }
  };

  const registrarSalida = async () => {
    setMensaje('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/registros/salida`, {
        empleadoId: user.empleadoId
      });
      setMensaje(`Salida registrada a las ${response.data.hora}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar salida');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="container">
        <div className="card">
          <h2>Registro de Horario</h2>
          <p>Empleado: {user.nombre} {user.apellido}</p>
          
          {mensaje && <div className="alert alert-success">{mensaje}</div>}
          {error && <div className="alert alert-error">{error}</div>}
          
          <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
            <button 
              onClick={registrarEntrada} 
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Entrada'}
            </button>
            
            <button 
              onClick={registrarSalida} 
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Salida'}
            </button>
          </div>
          
          <div style={{marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px'}}>
            <h4>Instrucciones:</h4>
            <ul style={{marginTop: '0.5rem', marginLeft: '1.5rem'}}>
              <li>Presiona "Registrar Entrada" al llegar</li>
              <li>Presiona "Registrar Salida" al terminar tu jornada</li>
              <li>Los registros quedan guardados automáticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistroHorario;
