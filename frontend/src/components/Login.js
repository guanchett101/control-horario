import React, { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import { supabase } from '../supabaseClient';
import './Login.css';

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
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          username,
          rol,
          empleados (
            nombre,
            apellido
          )
        `)
        .order('username', { ascending: true });

      if (error) throw error;

      const usuariosFormateados = data.map(u => ({
        username: u.username,
        nombre: u.empleados.nombre,
        apellido: u.empleados.apellido,
        rol: u.rol
      }));

      setUsuarios(usuariosFormateados);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error de conexión. Verifica tu internet o recarga la página.');
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
      // Obtener usuario de la base de datos
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          empleados (
            nombre,
            apellido
          )
        `)
        .eq('username', selectedUser)
        .single();

      if (error || !data) {
        setError('Credenciales inválidas');
        setPassword('');
        setLoading(false);
        return;
      }

      // Verificar contraseña
      const isMatch = await bcrypt.compare(password, data.password_hash);
      if (!isMatch) {
        setError('Credenciales inválidas');
        setPassword('');
        setLoading(false);
        return;
      }

      // Crear token simple (solo para mantener compatibilidad)
      const token = btoa(JSON.stringify({ 
        id: data.id, 
        empleadoId: data.empleado_id, 
        rol: data.rol,
        timestamp: Date.now()
      }));

      const user = {
        id: data.id,
        empleadoId: data.empleado_id,
        nombre: data.empleados.nombre,
        apellido: data.empleados.apellido,
        rol: data.rol,
        username: data.username
      };

      onLogin(user, token);
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de conexión con el servidor');
      setPassword('');
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
          <div style={{ textAlign: 'center', padding: '2rem' }}>
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
