import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/usuarios`);
      setUsuarios(response.data || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setUsuarios([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });

      onLogin(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Control de Horarios</h2>
        <p className="subtitle">Iniciar Sesión</p>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        {usuarios.length > 0 && (
          <div className="usuarios-disponibles">
            <p><strong>Usuarios disponibles:</strong></p>
            <ul>
              {usuarios.map((user) => (
                <li key={user.username}>
                  {user.nombre} {user.apellido} - <code>{user.username}</code>
                  {user.rol === 'admin' && <span className="badge-admin"> (Admin)</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
