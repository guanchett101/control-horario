import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';
import bgImage from '../assets/images/login-bg.png';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function Login({ onLogin }) {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth?action=usuarios`);
      const data = response?.data;
      if (Array.isArray(data)) {
        setUsuarios(data);
      } else {
        setUsuarios([]);
        setError('No se pudo cargar la lista de usuarios. Puedes escribir tu nombre para intentar acceder.');
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      // Fallback: If API fails, allow manual entry by not setting users but stopping loading
      setUsuarios([]);
      const errorMsg = err.response?.data?.error || err.message || 'Error desconocido';
      setError(`Error cargando usuarios: ${errorMsg}. Puedes escribir manual.`);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedUser || loading) return;

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth?action=login`, {
        username: selectedUser,
        password: password
      });

      const { user, token } = response.data;
      onLogin(user, token);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Error de autenticación. Revisa tus credenciales.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-background" style={{ backgroundImage: `url(${bgImage})` }}></div>

      <div className="login-container fade-in">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-icon">⏰</div>
            <h1>Control de Horarios</h1>
            <p className="subtitle">Gestión de Tiempo Profesional</p>
          </div>

          {error && (
            <div className="login-error slide-in">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {loadingUsers ? (
            <div className="loading-users">
              <div className="spinner"></div>
              <p>Sincronizando equipo...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="user-select">Identifícate</label>
                {usuarios.length > 0 ? (
                  <div className="select-wrapper">
                    <select
                      id="user-select"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      required
                      className={selectedUser ? 'has-value' : ''}
                    >
                      <option value="" disabled>-- Selecciona tu nombre --</option>
                      {usuarios.map((user) => (
                        <option key={user.username} value={user.username}>
                          {user.nombre} {user.apellido}
                        </option>
                      ))}
                    </select>
                    <span className="user-role-badge">
                      {usuarios.find(u => u.username === selectedUser)?.rol || 'Usuario'}
                    </span>
                  </div>
                ) : (
                  <div className="input-wrapper">
                    <input
                      id="user-input"
                      type="text"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      required
                      placeholder="Escribe tu usuario (ej. Juan)"
                      className="manual-user-input"
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Tu Clave Acceso</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="login-actions">
                <button
                  type="submit"
                  className={`login-button ${loading ? 'loading' : ''}`}
                  disabled={loading || !selectedUser}
                >
                  <span className="button-text">
                    {loading ? 'Iniciando sesión...' : 'Entrar al Panel'}
                  </span>
                  {!loading && <span className="button-icon">→</span>}
                </button>
              </div>

              <div className="login-footer">
                <p>© 2026 Sistema Horario • Seguridad Supabase</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
