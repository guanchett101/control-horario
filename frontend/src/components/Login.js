import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Login({ onLogin }) {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/usuarios`);
      setUsuarios(response.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: selectedUser,
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
        
        {loadingUsers ? (
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label>Selecciona tu usuario</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
                autoFocus
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">-- Selecciona tu nombre --</option>
                {usuarios.map((user) => (
                  <option key={user.username} value={user.username}>
                    {user.nombre} {user.apellido} ({user.rol})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Ingresa tu contraseña"
                autoComplete="off"
                name="user-password"
              />
            </div>
            
            <button type="submit" className="btn btn-primary btn-block" disabled={loading || !selectedUser}>
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
