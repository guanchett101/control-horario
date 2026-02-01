import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function CambiarPassword({ user, onLogout }) {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    // Validaciones
    if (passwordNueva.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordNueva !== passwordConfirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordActual === passwordNueva) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/cambiar-password`, {
        userId: user.id,
        passwordActual,
        passwordNueva
      });

      setMensaje('✅ Contraseña cambiada exitosamente');
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirmar('');
      
      setTimeout(() => {
        setMensaje('');
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem', color: '#111827' }}>🔐 Cambiar Contraseña</h2>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            background: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.9rem', color: '#1e40af' }}>
              👤 <strong>{user.nombre} {user.apellido}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#3b82f6', marginTop: '0.25rem' }}>
              Usuario: {user.username || 'N/A'}
            </div>
          </div>

          {mensaje && (
            <div style={{
              background: '#d1fae5',
              color: '#065f46',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid #a7f3d0',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}>
              {mensaje}
            </div>
          )}
          
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid #fecaca',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Contraseña Actual *</label>
              <input
                type="password"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                required
                placeholder="Ingresa tu contraseña actual"
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label>Nueva Contraseña *</label>
              <input
                type="password"
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                required
                minLength="6"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label>Confirmar Nueva Contraseña *</label>
              <input
                type="password"
                value={passwordConfirmar}
                onChange={(e) => setPasswordConfirmar(e.target.value)}
                required
                minLength="6"
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? '🔄 Cambiando...' : '💾 Cambiar Contraseña'}
            </button>
          </form>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f3f4f6',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: '600', color: '#111827' }}>
              💡 Consejos de seguridad
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#4b5563', fontSize: '0.85rem', lineHeight: '1.8' }}>
              <li>Usa al menos 6 caracteres</li>
              <li>Combina letras y números</li>
              <li>No uses información personal obvia</li>
              <li>Cambia tu contraseña periódicamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CambiarPassword;
